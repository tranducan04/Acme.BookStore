import type { EntityDto } from '@abp/ng.core';
import type { NotificationType } from './notification-type.enum';

export interface NotificationDto extends EntityDto<string> {
  userId?: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  targetUrl?: string | null;
  isRead?: boolean;
  creationTime?: string;
}
