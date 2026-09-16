
export interface CreatePaymentDto {
  orderId?: string;
  amount?: number;
  paymentMethod?: string;
}

export interface PaymentResultDto {
  success?: boolean;
  transactionId?: string;
  qrCodeUrl?: string;
  message?: string;
}
