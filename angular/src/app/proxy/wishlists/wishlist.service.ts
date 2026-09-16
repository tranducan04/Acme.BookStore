import type { FavoriteBookStatDto, WishlistItemDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  getMyWishlist = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, WishlistItemDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/wishlist/my-wishlist',
    },
    { apiName: this.apiName,...config });
  

  getMyWishlistBookIds = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/wishlist/my-wishlist-book-ids',
    },
    { apiName: this.apiName,...config });
  

  getTopFavoriteBooks = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, FavoriteBookStatDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/wishlist/top-favorite-books',
    },
    { apiName: this.apiName,...config });
  

  toggleWishlist = (bookId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: `/api/app/wishlist/toggle-wishlist/${bookId}`,
    },
    { apiName: this.apiName,...config });
}