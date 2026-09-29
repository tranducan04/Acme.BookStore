import type { CouponDto, CreateUpdateCouponDto, GetCouponListDto, ValidateCouponInputDto, CouponValidationResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private restService = inject(RestService);
  apiName = 'Default';

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CouponDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/coupon/${id}`,
    },
    { apiName: this.apiName, ...config });

  getList = (input: GetCouponListDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CouponDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/coupon',
      params: { 
        filter: input.filter, 
        isActive: input.isActive, 
        sorting: input.sorting, 
        skipCount: input.skipCount, 
        maxResultCount: input.maxResultCount 
      },
    },
    { apiName: this.apiName, ...config });

  create = (input: CreateUpdateCouponDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CouponDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/coupon',
      body: input,
    },
    { apiName: this.apiName, ...config });

  update = (id: string, input: CreateUpdateCouponDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CouponDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/coupon/${id}`,
      body: input,
    },
    { apiName: this.apiName, ...config });

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/coupon/${id}`,
    },
    { apiName: this.apiName, ...config });

  toggleActive = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: `/api/app/coupon/${id}/toggle-active`,
    },
    { apiName: this.apiName, ...config });

  validateCoupon = (input: ValidateCouponInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CouponValidationResultDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/coupon/validate-coupon',
      body: input,
    },
    { apiName: this.apiName, ...config });
}
