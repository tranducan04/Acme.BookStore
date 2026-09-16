import type { AuditedEntityDto } from '@abp/ng.core';
import type { BookType } from './book-type.enum';

export interface BookDto extends AuditedEntityDto<string> {
  name?: string;
  type?: BookType;
  publishDate?: string;
  price?: number;
  originalPrice?: number | null;
  authorId?: string | null;
  authorName?: string;
  publisherId?: string | null;
  publisherName?: string;
  stockCount?: number;
  coverImage?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  ageLimit?: number;
  isActive?: boolean;
}

export interface CreateUpdateBookDto {
  name: string;
  type: BookType;
  publishDate: string;
  price: number;
  originalPrice?: number | null;
  authorId: string | null;
  publisherId: string | null;
  stockCount?: number;
  coverImage?: string | null;
  categoryId: string | null;
  ageLimit?: number;
  isActive?: boolean;
}
