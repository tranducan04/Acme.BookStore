import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatMessageDto } from '../../../proxy/chats/models';
import { ChatSignalRService } from '../../chat/chat-signalr.service';
import { ConfigStateService, PermissionService, CoreModule } from '@abp/ng.core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-customer-chat',
  standalone: true,
  imports: [CommonModule, CoreModule, DatePipe],
  templateUrl: './customer-chat.component.html',
  styleUrls: ['./customer-chat.component.scss'],
})
export class CustomerChatComponent implements OnInit {
  private chatService = inject(ChatService);
  public chatSignalR = inject(ChatSignalRService);
  private configState = inject(ConfigStateService);
  private permission = inject(PermissionService);
  private oAuthService = inject(OAuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // === ANGULAR SIGNALS STATE ===
  readonly adminId = signal<string>('');
  readonly messages = signal<ChatMessageDto[]>([]);
  readonly inputText = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isSending = signal<boolean>(false);
  readonly currentUserId = signal<string>('');

  // Trạng thái đăng nhập được suy ra từ currentUserId
  readonly isLoggedIn = computed(() => !!this.currentUserId());

  ngOnInit(): void {
    // Nếu là Admin, chuyển hướng sang trang quản trị chat
    if (this.permission.getGrantedPolicy('BookStore.Books.Create')) {
      this.router.navigateByUrl('/admin/chat');
      return;
    }

    const userId = this.configState.getDeep('currentUser.id') || this.configState.getOne('currentUser')?.id || '';
    this.currentUserId.set(userId);

    // Chỉ kết nối và tải tin nhắn nếu người dùng đã đăng nhập
    if (this.isLoggedIn()) {
      this.fetchAdminIdAndLoad();
      this.initSignalR();
    }
  }

  /** Chuyển hướng người dùng sang trang đăng nhập */
  login(): void {
    this.oAuthService.initLoginFlow();
  }

  /** Lấy Admin ID từ API và tải lịch sử chat */
  fetchAdminIdAndLoad(): void {
    this.isLoading.set(true);
    this.chatService.getAdminId().subscribe({
      next: (id) => {
        this.adminId.set(id || '');
        if (id) {
          this.loadHistory();
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Không thể lấy Admin ID:', err);
        this.isLoading.set(false);
      },
    });
  }

  /** Tải lịch sử tin nhắn */
  loadHistory(): void {
    if (!this.adminId()) return;

    this.chatService.getMyChatHistory(this.adminId()).subscribe({
      next: (res) => {
        this.messages.set(res || []);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Lỗi khi tải lịch sử chat:', err);
        this.isLoading.set(false);
      },
    });
  }

  /** Khởi tạo kết nối SignalR và lắng nghe tin nhắn */
  async initSignalR(): Promise<void> {
    await this.chatSignalR.startConnection();

    this.chatSignalR.messageReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => {
        if (!msg) return;

        const uid = this.currentUserId().toLowerCase();
        const adm = this.adminId().toLowerCase();
        const sId = (msg.senderId || '').toLowerCase();
        const rId = (msg.receiverId || '').toLowerCase();

        // Xác định tin nhắn là của tôi hay đối phương
        msg.isMyMessage = Boolean(
          (uid && sId === uid) ||
          (adm && rId === adm && sId !== adm)
        );

        if (!this.messages().some((m) => m.id === msg.id)) {
          this.messages.update((prev) => [...prev, msg]);
          this.scrollToBottom();
        }
      });
  }

  /** Gửi tin nhắn qua SignalR */
  async send(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || !this.adminId() || this.isSending()) return;

    this.inputText.set('');
    this.isSending.set(true);

    try {
      await this.chatSignalR.sendMessage(this.adminId(), text);
      this.scrollToBottom();
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      this.inputText.set(text); // Phục hồi nội dung nếu lỗi
    } finally {
      this.isSending.set(false);
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('chat-messages-box');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
