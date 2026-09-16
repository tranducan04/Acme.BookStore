import type { CreatePaymentDto, PaymentResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  createVietQrPayment = (input: CreatePaymentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PaymentResultDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/payment/viet-qr-payment',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  verifyPayment = (transactionId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: `/api/app/payment/verify-payment/${transactionId}`,
    },
    { apiName: this.apiName,...config });
}