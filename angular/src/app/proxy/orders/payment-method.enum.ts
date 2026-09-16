import { mapEnumToOptions } from '@abp/ng.core';

export enum PaymentMethod {
  COD = 0,
  VietQR = 1,
  MoMo = 2,
}

export const paymentMethodOptions = mapEnumToOptions(PaymentMethod);
