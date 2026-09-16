import type { EntityDto } from '@abp/ng.core';
import type { BookType } from '../books/book-type.enum';

export interface FavoriteBookStatDto extends EntityDto<string> {
  rank?: number;
  bookId?: string;
  bookName?: string;
  coverImage?: string | null;
  price?: number;
  stockCount?: number;
  authorName?: string;
  favoriteCount?: number;
}

export interface WishlistItemDto extends EntityDto<string> {
  bookId?: string;
  bookName?: string;
  coverImage?: string | null;
  price?: number;
  originalPrice?: number | null;
  authorName?: string;
  stockCount?: number;
  type?: BookType;
  creationTime?: string;
}
