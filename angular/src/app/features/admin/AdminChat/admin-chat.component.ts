import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatMessageDto, ConversationDto } from '../../../proxy/chats/models';
import { ChatSignalRService } from '../../chat/chat-signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss'],
})
export class AdminChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private chatSignalR = inject(ChatSignalRService);

  conversations: ConversationDto[] = [];
  selectedUser: ConversationDto | null = null;
  messages: ChatMessageDto[] = [];
  newMessage = '';
  private signalRSub?: Subscription;

  ngOnInit(): void {
    this.loadConversations();
    this.initSignalR();
  }

  async initSignalR(): Promise<void> {
    await this.chatSignalR.startConnection();
    this.signalRSub = this.chatSignalR.messageReceived$.subscribe((msg) => {
      if (msg) {
        if (
          this.selectedUser &&
          (msg.senderId?.toLowerCase() === this.selectedUser.userId?.toLowerCase() ||
            msg.receiverId?.toLowerCase() === this.selectedUser.userId?.toLowerCase())
        ) {
          msg.isMyMessage = msg.senderId?.toLowerCase() !== this.selectedUser.userId?.toLowerCase();
          if (!this.messages.some((m) => m.id === msg.id)) {
            this.messages.push(msg);
            this.scrollToBottom();
          }
        }
        this.loadConversations();
      }
    });
  }

  loadConversations(): void {
    this.chatService.getAdminConversationList().subscribe((res) => {
      this.conversations = res || [];
    });
  }

  selectConversation(conv: ConversationDto): void {
    this.selectedUser = conv;
    if (conv.userId) {
      this.chatService.getMyChatHistory(conv.userId).subscribe((msgs) => {
        this.messages = msgs || [];
        this.scrollToBottom();
      });
      this.chatService.markAsRead(conv.userId).subscribe(() => {
        conv.unreadCount = 0;
      });
    }
  }

  async send(): Promise<void> {
    if (!this.newMessage || !this.newMessage.trim() || !this.selectedUser?.userId) return;

    const msgText = this.newMessage.trim();
    const targetUserId = this.selectedUser.userId;
    this.newMessage = '';

    await this.chatSignalR.sendMessage(targetUserId, msgText);
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('admin-chat-messages-box');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
  }
}
