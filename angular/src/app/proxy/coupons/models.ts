import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2,
}

export interface CouponDto extends FullAuditedEntityDto<string> {
  code: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  maxUsageCount: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateUpdateCouponDto {
  code: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  maxUsageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface GetCouponListDto extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean | null;
}

export interface ValidateCouponInputDto {
  code: string;
  orderTotal: number;
}

export interface CouponValidationResultDto {
  isValid: boolean;
  errorMessage?: string | null;
  couponId?: string | null;
  code?: string | null;
  title?: string | null;
  discountAmount: number;
  finalTotal: number;
}
