import { mapEnumToOptions } from '@abp/ng.core';

export enum NotificationType {
  Order = 0,
  Shipping = 1,
  Review = 2,
  System = 3,
}

export const notificationTypeOptions = mapEnumToOptions(NotificationType);
