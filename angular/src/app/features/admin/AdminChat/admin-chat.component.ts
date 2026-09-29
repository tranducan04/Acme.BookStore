import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatMessageDto, ConversationDto } from '../../../proxy/chats/models';
import { ChatSignalRService } from '../../chat/chat-signalr.service';
import { CoreModule } from '@abp/ng.core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, CoreModule, DatePipe],
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss'],
})
export class AdminChatComponent implements OnInit {
  private chatService = inject(ChatService);
  public chatSignalR = inject(ChatSignalRService);
  private destroyRef = inject(DestroyRef);

  // === ANGULAR SIGNALS STATE ===
  readonly conversations = signal<ConversationDto[]>([]);
  readonly selectedUser = signal<ConversationDto | null>(null);
  readonly messages = signal<ChatMessageDto[]>([]);
  readonly inputText = signal<string>('');
  readonly searchTerm = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isLoadingMessages = signal<boolean>(false);
  readonly isSending = signal<boolean>(false);

  // Lọc cuộc trò chuyện theo ô tìm kiếm
  readonly filteredConversations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.conversations();
    return this.conversations().filter(
      (c) =>
        (c.userName || '').toLowerCase().includes(term) ||
        (c.lastMessage || '').toLowerCase().includes(term)
    );
  });

  // Tổng số tin nhắn chưa đọc của tất cả khách hàng
  readonly totalUnread = computed(() =>
    this.conversations().reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  );

  ngOnInit(): void {
    this.loadConversations();
    this.initSignalR();
  }

  /** Tải danh sách các cuộc hội thoại của khách hàng */
  loadConversations(): void {
    this.isLoading.set(true);
    this.chatService.getAdminConversationList().subscribe({
      next: (res) => {
        this.conversations.set(res || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách hội thoại:', err);
        this.isLoading.set(false);
      },
    });
  }

  /** Khởi tạo SignalR và lắng nghe tin nhắn */
  async initSignalR(): Promise<void> {
    await this.chatSignalR.startConnection();

    this.chatSignalR.messageReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => {
        if (!msg) return;

        const active = this.selectedUser();

        // 1. Cập nhật vào khung chat đang mở (nếu tin nhắn thuộc về khách này)
        if (
          active &&
          (msg.senderId?.toLowerCase() === active.userId?.toLowerCase() ||
            msg.receiverId?.toLowerCase() === active.userId?.toLowerCase())
        ) {
          msg.isMyMessage = msg.senderId?.toLowerCase() !== active.userId?.toLowerCase();
          if (!this.messages().some((m) => m.id === msg.id)) {
            this.messages.update((prev) => [...prev, msg]);
            this.scrollToBottom();
          }
        }

        // 2. Cập nhật danh sách hội thoại theo thời gian thực
        const customerId =
          msg.senderId?.toLowerCase() === active?.userId?.toLowerCase() || msg.senderName !== 'admin'
            ? msg.senderId
            : msg.receiverId;

        if (customerId) {
          this.conversations.update((convs) => {
            const idx = convs.findIndex((c) => c.userId?.toLowerCase() === customerId.toLowerCase());
            if (idx > -1) {
              const existing = { ...convs[idx] };
              existing.lastMessage = msg.message;
              existing.lastMessageTime = msg.creationTime;

              // Tăng unreadCount nếu Admin không đang mở cuộc hội thoại này
              if (!active || active.userId?.toLowerCase() !== customerId.toLowerCase()) {
                existing.unreadCount = (existing.unreadCount || 0) + 1;
              }

              // Đưa cuộc trò chuyện lên vị trí đầu tiên
              const copy = [...convs];
              copy.splice(idx, 1);
              return [existing, ...copy];
            } else {
              // Hội thoại của khách hàng mới
              const newConv: ConversationDto = {
                id: customerId,
                userId: customerId,
                userName: msg.senderName || 'Khách hàng',
                lastMessage: msg.message,
                lastMessageTime: msg.creationTime,
                unreadCount: !active || active.userId?.toLowerCase() !== customerId.toLowerCase() ? 1 : 0,
              };
              return [newConv, ...convs];
            }
          });
        }
      });
  }

  /** Chọn một cuộc hội thoại từ danh sách */
  selectConversation(conv: ConversationDto): void {
    this.selectedUser.set(conv);
    if (!conv.userId) return;

    this.isLoadingMessages.set(true);
    this.chatService.getMyChatHistory(conv.userId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs || []);
        this.isLoadingMessages.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Lỗi khi tải tin nhắn:', err);
        this.isLoadingMessages.set(false);
      },
    });

    // Đánh dấu đã đọc và xóa badge unread
    this.chatService.markAsRead(conv.userId).subscribe({
      next: () => {
        this.conversations.update((convs) =>
          convs.map((c) =>
            c.userId?.toLowerCase() === conv.userId?.toLowerCase() ? { ...c, unreadCount: 0 } : c
          )
        );
      },
      error: (err) => console.error('Lỗi khi đánh dấu đã đọc:', err),
    });
  }

  /** Admin gửi tin nhắn trả lời khách hàng */
  async send(): Promise<void> {
    const text = this.inputText().trim();
    const active = this.selectedUser();
    if (!text || !active?.userId || this.isSending()) return;

    this.inputText.set('');
    this.isSending.set(true);

    try {
      await this.chatSignalR.sendMessage(active.userId, text);
      this.scrollToBottom();
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      this.inputText.set(text); // Phục hồi lại nếu lỗi
    } finally {
      this.isSending.set(false);
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('admin-chat-messages-box');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  /** Lấy chữ cái viết tắt của tên người dùng */
  getInitials(name?: string): string {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /** Tạo màu gradient avatar độc đáo theo tên */
  getAvatarColor(name?: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #0ea5e9, #0284c7)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
    ];
    let hash = 0;
    const str = name || 'Khach';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
  /** Tính thời gian hoạt động tương đối */
  getTimeAgo(date?: string | Date): string {
    if (!date) return 'Chưa có hoạt động';

    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));

    if (diffInMinutes < 2) {
      return 'Đang hoạt động'; // Dưới 2 phút coi như đang online
    } else if (diffInMinutes < 60) {
      return `Hoạt động ${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hoạt động ${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hoạt động ${days} ngày trước`;
    }
  }

  /** Kiểm tra nếu đã quá 5 phút không có tin nhắn thì đổi chấm xám */
  isOnline(date?: string | Date): boolean {
    if (!date) return false;
    const diffInMinutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60));
    return diffInMinutes < 5;
  }

}
