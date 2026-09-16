import type { ChatMessageDto, ConversationDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  getAdminConversationList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ConversationDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/chat/admin-conversation-list',
    },
    { apiName: this.apiName,...config });
  

  getMyChatHistory = (otherUserId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatMessageDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/chat/my-chat-history/${otherUserId}`,
    },
    { apiName: this.apiName,...config });
  

  markAsRead = (senderId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: `/api/app/chat/mark-as-read/${senderId}`,
    },
    { apiName: this.apiName,...config });
}