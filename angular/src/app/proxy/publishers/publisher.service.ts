import type { CreateUpdatePublisherDto, PublisherDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PublisherService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  create = (input: CreateUpdatePublisherDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PublisherDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/publisher',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/publisher/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PublisherDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/publisher/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<PublisherDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/publisher',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdatePublisherDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PublisherDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/publisher/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
}