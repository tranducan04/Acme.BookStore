import type { NotificationDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  getMyNotifications = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, NotificationDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/notification/my-notifications',
    },
    { apiName: this.apiName,...config });
  

  getUnreadCount = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, number>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/notification/unread-count',
    },
    { apiName: this.apiName,...config });
  

  markAllAsRead = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/notification/mark-all-as-read',
    },
    { apiName: this.apiName,...config });
  

  markAsRead = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: `/api/app/notification/${id}/mark-as-read`,
    },
    { apiName: this.apiName,...config });
}