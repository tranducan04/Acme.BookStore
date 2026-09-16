import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, PermissionService } from '@abp/ng.core';
import { BookService, bookTypeOptions } from '@proxy/books';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { BookReviewSummaryDto } from '../../../proxy/book-reviews/models';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { firstValueFrom } from 'rxjs';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [CommonModule, FormsModule, RouterLink]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private bookService = inject(BookService);
  private reviewService = inject(BookReviewService);
  public permission = inject(PermissionService);
  public cartStore = inject(CartSignalStore);
  public isModalOpen = signal<boolean>(false);
  public featuredBooks = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  public selectedBook = signal<any | null>(null);
  // 🌟 SIGNALS CHO TÍNH NĂNG ĐÁNH GIÁ & GỢI Ý
  public reviewSummary = signal<BookReviewSummaryDto | null>(null);
  public userRating = signal<number>(5);
  public userComment = signal<string>('');
  public isSubmittingReview = signal<boolean>(false);
  private wishlistService = inject(WishlistService);
  public wishlistBookIds = signal<string[]>([]);
  public bookTypes = bookTypeOptions;
  public addingBookId = signal<string | null>(null);

  public Math = Math;

  getStarsArray(rating: number = 5): { full: boolean; empty: boolean }[] {
    const stars = [];
    const rounded = Math.round((rating || 5) * 2) / 2; // Làm tròn đến 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push({ full: true, empty: false });
      } else {
        stars.push({ full: false, empty: true });
      }
    }
    return stars;
  }

  get hasLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }
  ngOnInit(): void {
    this.loadFeaturedBooks();
    this.loadWishlist();
  }
  async loadFeaturedBooks() {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.bookService.getList({ maxResultCount: 100, skipCount: 0 }));
      const allBooks = res.items || [];
      // Lọc lấy top sách nổi bật
      const topPriced = allBooks.sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 4);

      // Tải kèm thông tin review summary cho từng sách nổi bật
      const enrichedBooks = await Promise.all(
        topPriced.map(async (book) => {
          if (!book.id) return { ...book, averageRating: 5, totalReviews: 0 };
          try {
            const summary = await firstValueFrom(this.reviewService.getSummary(book.id));
            return {
              ...book,
              averageRating: summary?.averageRating || 5,
              totalReviews: summary?.totalReviews || 0
            };
          } catch {
            return { ...book, averageRating: 5, totalReviews: 0 };
          }
        })
      );

      this.featuredBooks.set(enrichedBooks);
    } catch (err) {
      console.error('Lỗi tải danh sách sách nổi bật:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
  login() {
    this.authService.navigateToLogin();
  }
  // 🌟 MỞ MODAL XEM CHI TIẾT SÁCH & TẢI ĐÁNH GIÁ + GỢI Ý
  async openDetailModal(book: any) {
    this.selectedBook.set(book);
    this.isModalOpen.set(true);
    this.userRating.set(5);
    this.userComment.set('');
    await this.loadReviewSummary(book.id);
  }
  // 2. Thêm hàm xử lý khóa nút & phản hồi "✓ Đã thêm"
  async addToCart(event: Event, bookId: string) {
    event.stopPropagation(); // Ngăn mở modal chi tiết sách
    if (this.addingBookId()) return; // 🛑 Chặn bấm liên tục
    this.addingBookId.set(bookId);
    try {
      await this.cartStore.addToCart(bookId, 1);
    } finally {
      // ⌛ Đợi 1.2 giây rồi khôi phục lại trạng thái nút ban đầu
      setTimeout(() => this.addingBookId.set(null), 1200);
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedBook.set(null);
    this.reviewSummary.set(null);
  }
  // 🌟 TẢI THÔNG TIN ĐÁNH GIÁ VÀ SÁCH GỢI Ý
  async loadReviewSummary(bookId: string) {
    try {
      const summary = await firstValueFrom(this.reviewService.getSummary(bookId));
      this.reviewSummary.set(summary);
    } catch (err) {
      console.error('Lỗi tải đánh giá và sách gợi ý:', err);
    }
  }
  // 🌟 CHỌN SỐ SAO (1 - 5)
  setRating(stars: number) {
    this.userRating.set(stars);
  }
  // 🌟 GỬI ĐÁNH GIÁ MỚI
  async submitReview() {
    if (!this.hasLoggedIn) {
      alert('⚠️ Vui lòng đăng nhập để đánh giá cuốn sách này!');
      this.login();
      return;
    }
    const comment = this.userComment().trim();
    if (!comment) {
      alert('⚠️ Vui lòng nhập nội dung nhận xét của bạn!');
      return;
    }
    const book = this.selectedBook();
    if (!book || !book.id) return;
    this.isSubmittingReview.set(true);
    try {
      await firstValueFrom(this.reviewService.create({
        bookId: book.id,
        rating: this.userRating(),
        comment: comment
      }));
      this.userComment.set('');
      this.userRating.set(5);
      alert('🎉 Cảm ơn bạn đã gửi đánh giá cho cuốn sách này!');
      await this.loadReviewSummary(book.id);
      this.loadFeaturedBooks();
    } catch (err: any) {
      console.error('Lỗi gửi đánh giá:', err);
      alert('❌ Gửi đánh giá thất bại: ' + (err?.error?.error?.message || err?.message));
    } finally {
      this.isSubmittingReview.set(false);
    }
  }
  // 🌟 XÓA BÌNH LUẬN (CHO ADMIN)
  async deleteReview(reviewId: string) {
    if (confirm('❓ Bạn có chắc muốn xóa nhận xét này không?')) {
      try {
        await firstValueFrom(this.reviewService.delete(reviewId));
        const book = this.selectedBook();
        if (book?.id) {
          await this.loadReviewSummary(book.id);
          this.loadFeaturedBooks();
        }
      } catch (err) {
        console.error('Lỗi xóa đánh giá:', err);
      }
    }
  }
  getBookTypeName(typeVal: any): string {
    const found = this.bookTypes.find(t => t.value === Number(typeVal));
    return found ? found.key : 'Khác';
  }
  async loadWishlist() {
    if (!this.hasLoggedIn) return;
    try {
      const ids = await firstValueFrom(this.wishlistService.getMyWishlistBookIds());
      this.wishlistBookIds.set(ids || []);
    } catch (err) {
      console.error('Chưa đăng nhập hoặc lỗi tải wishlist:', err);
    }
  }
  async toggleWishlist(event: Event, bookId?: string) {
    event.stopPropagation();
    if (!bookId) return;
    if (!this.hasLoggedIn) {
      alert('⚠️ Vui lòng đăng nhập để thêm sản phẩm vào danh sách Yêu thích!');
      this.login();
      return;
    }
    try {
      const isAdded = await firstValueFrom(this.wishlistService.toggleWishlist(bookId));
      if (isAdded) {
        this.wishlistBookIds.update(ids => [...ids, bookId]);
      } else {
        this.wishlistBookIds.update(ids => ids.filter(id => id !== bookId));
      }
    } catch (err) {
      console.error('Lỗi khi thả tim:', err);
    }
  }
  isBookInWishlist(bookId?: string): boolean {
    if (!bookId) return false;
    return this.wishlistBookIds().includes(bookId);
  }
}
