import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@abp/ng.core';
import { BookService } from '@proxy/books';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { BookReviewSummaryDto, BookReviewDto } from '../../../proxy/book-reviews/models';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { ToastService } from '../../../shared/services/toast.service';
import { StorefrontBook, formatAgeLimit } from '../../../shared/models/storefront.models';
import { StarRatingComponent } from '../../../shared/components/storefront/star-rating/star-rating.component';
import { PriceTagComponent } from '../../../shared/components/storefront/price-tag/price-tag.component';
import { QuantitySelectorComponent } from '../../../shared/components/storefront/quantity-selector/quantity-selector.component';
import { BookCardComponent } from '../../../shared/components/storefront/book-card/book-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StarRatingComponent,
    PriceTagComponent,
    QuantitySelectorComponent,
    BookCardComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly reviewService = inject(BookReviewService);
  private readonly wishlistService = inject(WishlistService);
  readonly cartStore = inject(CartSignalStore);
  private readonly toastService = inject(ToastService);
  readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(true);
  readonly book = signal<StorefrontBook | null>(null);
  readonly reviewSummary = signal<BookReviewSummaryDto | null>(null);
  readonly relatedBooks = signal<StorefrontBook[]>([]);
  readonly isWishlisted = signal<boolean>(false);

  readonly selectedQuantity = signal<number>(1);
  readonly activeTab = signal<'description' | 'specs' | 'reviews'>('description');

  // Review submission
  readonly newRating = signal<number>(5);
  readonly newComment = signal<string>('');
  readonly isSubmittingReview = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const bookId = params['id'];
      if (bookId) {
        this.loadBookDetails(bookId);
      }
    });
  }

  async loadBookDetails(bookId: string): Promise<void> {
    this.isLoading.set(true);
    this.selectedQuantity.set(1);
    try {
      const bookDto = await firstValueFrom(this.bookService.get(bookId));
      if (!bookDto) {
        this.toastService.showError('Không tìm thấy thông tin cuốn sách này.');
        this.router.navigate(['/books']);
        return;
      }

      // Check wishlist
      let isFav = false;
      if (this.authService.isAuthenticated) {
        try {
          const ids = await firstValueFrom(this.wishlistService.getMyWishlistBookIds());
          isFav = ids?.includes(bookId) || false;
        } catch {}
      }
      this.isWishlisted.set(isFav);

      // Load review summary & recommended
      let summary: BookReviewSummaryDto | null = null;
      try {
        summary = await firstValueFrom(this.reviewService.getSummary(bookId));
        this.reviewSummary.set(summary);
      } catch {}

      const sfBook: StorefrontBook = {
        id: bookDto.id || '',
        name: bookDto.name || '',
        type: bookDto.type ?? 0,
        categoryName: (bookDto as any).categoryName || 'Sách tổng hợp',
        categoryId: (bookDto as any).categoryId,
        publishDate: bookDto.publishDate || '',
        price: bookDto.price || 0,
        discountPrice: (bookDto as any).originalPrice && (bookDto as any).originalPrice > (bookDto.price || 0) ? (bookDto.price || 0) : undefined,
        authorId: (bookDto as any).authorId,
        authorName: (bookDto as any).authorName,
        publisherName: (bookDto as any).publisherName || 'Nhà xuất bản Tổng Hợp',
        coverImage: (bookDto as any).coverImage,
        stockCount: (bookDto as any).stockCount ?? 20,
        averageRating: summary?.averageRating || 5,
        reviewCount: summary?.totalReviews || 0,
        ageLimit: formatAgeLimit((bookDto as any).ageLimit),
        isWishlisted: isFav
      };

      this.book.set(sfBook);

      // Map recommended books
      if (summary?.recommendedBooks?.length) {
        const related = summary.recommendedBooks.map((b: any) => ({
          id: b.id,
          name: b.name,
          type: b.type,
          categoryName: b.categoryName || 'Sách liên quan',
          publishDate: b.publishDate,
          price: b.price || 0,
          discountPrice: b.originalPrice && b.originalPrice > b.price ? b.price : undefined,
          authorName: b.authorName,
          coverImage: b.coverImage,
          stockCount: b.stockCount ?? 10,
          averageRating: 5,
          reviewCount: 0,
          ageLimit: formatAgeLimit(b.ageLimit),
          isWishlisted: false
        }));
        this.relatedBooks.set(related);
      } else {
        // Fallback related from list
        try {
          const listRes = await firstValueFrom(this.bookService.getList({ maxResultCount: 4, skipCount: 0 }));
          const filtered = (listRes.items || []).filter(b => b.id !== bookId).slice(0, 4).map((b: any) => ({
            id: b.id,
            name: b.name,
            type: b.type,
            categoryName: b.categoryName || 'Sách cùng tác giả',
            publishDate: b.publishDate,
            price: b.price || 0,
            coverImage: b.coverImage,
            stockCount: b.stockCount ?? 10,
            averageRating: 5,
            reviewCount: 0,
            isWishlisted: false
          }));
          this.relatedBooks.set(filtered);
        } catch {}
      }

    } catch (err) {
      console.error('Lỗi tải chi tiết sách:', err);
      this.toastService.showError('Không thể tải chi tiết cuốn sách.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onQuantityChange(qty: number): void {
    this.selectedQuantity.set(qty);
  }

  async addToCart(): Promise<void> {
    const current = this.book();
    if (!current) return;

    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      this.authService.navigateToLogin();
      return;
    }

    try {
      await this.cartStore.addToCart(current.id, this.selectedQuantity());
      this.toastService.showSuccess(`Đã thêm ${this.selectedQuantity()} cuốn "${current.name}" vào giỏ hàng!`);
    } catch {
      this.toastService.showError('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  }

  async buyNow(): Promise<void> {
    const current = this.book();
    if (!current) return;

    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để đặt hàng!');
      this.authService.navigateToLogin();
      return;
    }

    try {
      await this.cartStore.addToCart(current.id, this.selectedQuantity());
      this.router.navigate(['/checkout']);
    } catch {
      this.toastService.showError('Có lỗi xảy ra khi tiến hành mua ngay.');
    }
  }

  async toggleWishlist(): Promise<void> {
    const current = this.book();
    if (!current) return;

    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để lưu sách yêu thích');
      this.authService.navigateToLogin();
      return;
    }

    try {
      const isFav = await firstValueFrom(this.wishlistService.toggleWishlist(current.id));
      this.isWishlisted.set(isFav);
      current.isWishlisted = isFav;
      if (isFav) {
        this.toastService.showSuccess(`Đã lưu "${current.name}" vào danh sách yêu thích!`);
      } else {
        this.toastService.showInfo(`Đã bỏ "${current.name}" khỏi danh sách yêu thích.`);
      }
    } catch {
      this.toastService.showError('Không thể cập nhật danh sách yêu thích.');
    }
  }

  async submitReview(): Promise<void> {
    const current = this.book();
    if (!current) return;

    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để gửi nhận xét');
      this.authService.navigateToLogin();
      return;
    }

    const comment = this.newComment().trim();
    if (!comment) {
      this.toastService.showWarning('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    this.isSubmittingReview.set(true);
    try {
      await firstValueFrom(this.reviewService.create({
        bookId: current.id,
        rating: this.newRating(),
        comment
      }));
      this.toastService.showSuccess('Cảm ơn bạn đã gửi đánh giá cho cuốn sách này!');
      this.newComment.set('');
      // Reload summary
      const sum = await firstValueFrom(this.reviewService.getSummary(current.id));
      this.reviewSummary.set(sum);
    } catch (err: any) {
      this.toastService.showError(err?.error?.error?.message || 'Không thể gửi đánh giá, vui lòng thử lại.');
    } finally {
      this.isSubmittingReview.set(false);
    }
  }
}
