import type { EntityDto } from '@abp/ng.core';

export interface AddBookToCartDto {
  bookId: string;
  count?: number;
}

export interface CartDto extends EntityDto<string> {
  userId?: string;
  items?: CartItemDto[];
  totalPrice?: number;
  totalCount?: number;
}

export interface CartItemDto extends EntityDto<string> {
  bookId?: string;
  bookName?: string;
  price?: number;
  count?: number;
  totalPrice?: number;
}
