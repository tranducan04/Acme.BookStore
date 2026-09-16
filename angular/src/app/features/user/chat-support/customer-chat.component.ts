import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../proxy/chats/chat.service';
import { ChatMessageDto } from '../../../proxy/chats/models';
import { ChatSignalRService } from '../../chat/chat-signalr.service';
import { ConfigStateService } from '@abp/ng.core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-chat.component.html',
  styleUrls: ['./customer-chat.component.scss'],
})
export class CustomerChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private chatSignalR = inject(ChatSignalRService);
  private configState = inject(ConfigStateService);

  adminId = '00000000-0000-0000-0000-000000000000'; // Default Admin ID
  messages: ChatMessageDto[] = [];
  newMessage = '';
  currentUserId = '';
  private signalRSub?: Subscription;

  ngOnInit(): void {
    this.currentUserId = this.configState.getDeep('currentUser.id') || this.configState.getOne('currentUser')?.id || '';
    this.loadHistory();
    this.initSignalR();
  }

  async initSignalR(): Promise<void> {
    await this.chatSignalR.startConnection();
    this.signalRSub = this.chatSignalR.messageReceived$.subscribe((msg) => {
      if (msg) {
        if (!this.currentUserId) {
          this.currentUserId = this.configState.getDeep('currentUser.id') || this.configState.getOne('currentUser')?.id || '';
        }
        msg.isMyMessage = msg.senderId?.toLowerCase() === this.currentUserId?.toLowerCase();
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
    if (!this.newMessage || !this.newMessage.trim()) return;

    const msgText = this.newMessage.trim();
    this.newMessage = '';

    await this.chatSignalR.sendMessage(this.adminId, msgText);
    this.scrollToBottom();
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
