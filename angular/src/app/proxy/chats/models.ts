import type { EntityDto } from '@abp/ng.core';

export interface ChatMessageDto extends EntityDto<string> {
  senderId?: string;
  receiverId?: string;
  senderName?: string;
  message?: string;
  isRead?: boolean;
  isMyMessage?: boolean;
  creationTime?: string;
}

export interface ConversationDto extends EntityDto<string> {
  userId?: string;
  userName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}
