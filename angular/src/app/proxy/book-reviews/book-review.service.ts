import type { BookReviewDto, BookReviewSummaryDto, CreateBookReviewDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookReviewService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  create = (input: CreateBookReviewDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BookReviewDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/book-review',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/book-review/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getListAdmin = (input: PagedAndSortedResultRequestDto, filter?: string, rating?: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BookReviewDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/book-review/admin',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount, filter, rating },
    },
    { apiName: this.apiName,...config });
  

  getSummary = (bookId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BookReviewSummaryDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/book-review/summary/${bookId}`,
    },
    { apiName: this.apiName,...config });
}