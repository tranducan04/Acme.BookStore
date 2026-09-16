import { mapEnumToOptions } from '@abp/ng.core';

export enum OrderStatus {
  Placed = 0,
  Processing = 1,
  Shipped = 2,
  Completed = 3,
  Cancelled = 4,
}

export const orderStatusOptions = mapEnumToOptions(OrderStatus);
