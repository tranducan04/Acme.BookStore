import type { CreateOrderDto, GetOrderFilterDto, OrderDto, UpdateOrderStatusDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  cancelMyOrder = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: `/api/app/order/${id}/cancel-my-order`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetOrderFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrderDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/order',
      params: { keyword: input.keyword, status: input.status, paymentMethod: input.paymentMethod, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getMyOrders = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrderDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/order/my-orders',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  post = (input: CreateOrderDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/order',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  putStatus = (id: string, input: UpdateOrderStatusDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/order/${id}/status`,
      body: input,
    },
    { apiName: this.apiName,...config });

  switchPaymentMethod = (id: string, paymentMethod: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: `/api/app/order/${id}/switch-payment-method`,
      params: { paymentMethod },
    },
    { apiName: this.apiName,...config });
}