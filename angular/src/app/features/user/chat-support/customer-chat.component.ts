import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatMessageDto } from '../../../proxy/chats/models';
import { ChatSignalRService } from '../../chat/chat-signalr.service';
import { ConfigStateService, PermissionService, CoreModule } from '@abp/ng.core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule],
  templateUrl: './customer-chat.component.html',
  styleUrls: ['./customer-chat.component.scss'],
})
export class CustomerChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private chatSignalR = inject(ChatSignalRService);
  private configState = inject(ConfigStateService);
  private permission = inject(PermissionService);
  private router = inject(Router);

  adminId = ''; // Sẽ được lấy động từ API
  messages: ChatMessageDto[] = [];
  newMessage = '';
  currentUserId = '';
  private signalRSub?: Subscription;

  ngOnInit(): void {
    if (this.permission.getGrantedPolicy('BookStore.Books.Create')) {
      this.router.navigateByUrl('/admin/chat');
      return;
    }
    this.currentUserId = this.configState.getDeep('currentUser.id') || this.configState.getOne('currentUser')?.id || '';
    this.fetchAdminIdAndLoad();
    this.initSignalR();
  }

  /** Lấy Admin ID từ API, sau đó load lịch sử chat */
  fetchAdminIdAndLoad(): void {
    this.chatService.getAdminId().subscribe({
      next: (id) => {
        console.log('=== Admin ID received:', id, typeof id, '===');
        this.adminId = id || '';
        console.log('=== adminId set to:', this.adminId, '===');
        if (this.adminId) {
          this.loadHistory();
        }
      },
      error: (err) => {
        console.error('Không thể lấy Admin ID:', err);
      },
    });
  }

  async initSignalR(): Promise<void> {
    await this.chatSignalR.startConnection();
    this.signalRSub = this.chatSignalR.messageReceived$.subscribe((msg) => {
      if (msg) {
        if (!this.currentUserId) {
          this.currentUserId = this.configState.getDeep('currentUser.id') || this.configState.getOne('currentUser')?.id || '';
        }
        // Tin nhắn của tôi nếu senderId trùng currentUserId hoặc receiverId là Admin
        msg.isMyMessage = Boolean(
          (this.currentUserId && msg.senderId?.toLowerCase() === this.currentUserId?.toLowerCase()) ||
          (this.adminId && msg.receiverId?.toLowerCase() === this.adminId?.toLowerCase() && msg.senderId?.toLowerCase() !== this.adminId?.toLowerCase())
        );
        if (!this.messages.some((m) => m.id === msg.id)) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      }
    });
  }

  loadHistory(): void {
    this.chatService.getMyChatHistory(this.adminId).subscribe((res) => {
      this.messages = res || [];
      this.scrollToBottom();
    });
  }

  async send(): Promise<void> {
    if (!this.newMessage || !this.newMessage.trim() || !this.adminId) {
      console.warn('send() aborted: empty message or adminId missing', {
        message: this.newMessage,
        adminId: this.adminId
      });
      return;
    }

    const msgText = this.newMessage.trim();
    this.newMessage = '';

    try {
      console.log('Sending message to admin:', this.adminId, msgText);
      await this.chatSignalR.sendMessage(this.adminId, msgText);
      this.scrollToBottom();
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      this.newMessage = msgText; // khôi phục nếu lỗi
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

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
  }
}
