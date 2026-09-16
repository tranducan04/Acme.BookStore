import { mapEnumToOptions } from '@abp/ng.core';

export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
}

export const paymentStatusOptions = mapEnumToOptions(PaymentStatus);
