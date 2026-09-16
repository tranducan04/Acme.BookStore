import type { EntityDto } from '@abp/ng.core';
import type { BookDto } from '../books/models';

export interface BookReviewDto extends EntityDto<string> {
  bookId?: string;
  bookName?: string;
  userId?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  creationTime?: string;
}

export interface BookReviewSummaryDto {
  bookId?: string;
  averageRating?: number;
  totalReviews?: number;
  reviews?: BookReviewDto[];
  recommendedBooks?: BookDto[];
}

export interface CreateBookReviewDto {
  bookId: string;
  rating?: number;
  comment: string;
}
