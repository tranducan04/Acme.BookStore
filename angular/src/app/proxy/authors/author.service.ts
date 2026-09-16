import type { AuthorDto, AuthorLookupDto, CreateAuthorDto, UpdateAuthorDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  create = (input: CreateAuthorDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AuthorDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/author',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/author/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AuthorDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/author/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getAuthorLookup = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<AuthorLookupDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/author/author-lookup',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AuthorDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/author',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: UpdateAuthorDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AuthorDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/author/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
}