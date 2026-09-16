import type { AddBookToCartDto, CartDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  deleteFromCart = (bookId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/cart/from-cart/${bookId}`,
    },
    { apiName: this.apiName,...config });
  

  get = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, CartDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/cart',
    },
    { apiName: this.apiName,...config });
  

  postToCart = (input: AddBookToCartDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/cart/to-cart',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  putCartItem = (bookId: string, count: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'PUT',
      url: `/api/app/cart/cart-item/${bookId}`,
      params: { count },
    },
    { apiName: this.apiName,...config });
}