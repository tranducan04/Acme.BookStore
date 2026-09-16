import type { AskChatBotDto, ChatBotResponseDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatBotService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  ask = (input: AskChatBotDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChatBotResponseDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/chat-bot/ask',
      body: input,
    },
    { apiName: this.apiName,...config });
}