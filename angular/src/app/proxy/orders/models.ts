import type { PaymentMethod } from './payment-method.enum';
import type { AuditedEntityDto, EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { OrderStatus } from './order-status.enum';
import type { PaymentStatus } from './payment-status.enum';

export interface CreateOrderDto {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}

export interface GetOrderFilterDto extends PagedAndSortedResultRequestDto {
  keyword?: string | null;
  status?: OrderStatus | null;
  paymentMethod?: PaymentMethod | null;
}

export interface OrderDto extends AuditedEntityDto<string> {
  userId?: string;
  orderNo?: string;
  status?: OrderStatus;
  totalAmount?: number;
  receiverName?: string;
  receiverPhone?: string;
  shippingAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  items?: OrderItemDto[];
}

export interface OrderItemDto extends EntityDto<string> {
  bookId?: string;
  bookName?: string;
  coverImage?: string | null;
  count?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
