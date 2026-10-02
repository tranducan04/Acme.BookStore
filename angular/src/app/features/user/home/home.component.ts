import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@abp/ng.core';
import { BookService } from '@proxy/books';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { CategoryService } from '../../../proxy/categories/category.service';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { ToastService } from '../../../shared/services/toast.service';
import { StorefrontBook, formatAgeLimit } from '../../../shared/models/storefront.models';
import { BookCardComponent } from '../../../shared/components/storefront/book-card/book-card.component';
import { CategoryCardComponent } from '../../../shared/components/storefront/category-card/category-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';
import { firstValueFrom } from 'rxjs';

interface HeroSlide {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BookCardComponent,
    CategoryCardComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly bookService = inject(BookService);
  private readonly reviewService = inject(BookReviewService);
  private readonly categoryService = inject(CategoryService);
  private readonly wishlistService = inject(WishlistService);
  readonly cartStore = inject(CartSignalStore);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal<boolean>(true);
  readonly featuredBooks = signal<StorefrontBook[]>([]);
  readonly newArrivalBooks = signal<StorefrontBook[]>([]);
  readonly categories = signal<{ id: string; name: string; icon: string; count?: number }[]>([]);
  readonly wishlistBookIds = signal<Set<string>>(new Set());

  // Hero Slider
  readonly currentSlide = signal<number>(0);
  private slideInterval: any;

  readonly heroSlides: HeroSlide[] = [
    {
      badge: 'Thư Viện Số Hiện Đại 2026',
      title: 'Khám Phá Thế Giới Tri Thức Đỉnh Cao',
      subtitle: 'Hơn 50,000+ tựa sách chọn lọc, bản quyền chính thống từ các nhà xuất bản hàng đầu với ưu đãi hấp dẫn.',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Khám Phá Ngay',
      ctaLink: '/books'
    },
    {
      badge: 'Đặc Quyền Hội Viên',
      title: 'Đọc Sách Không Giới Hạn, Ưu Đãi Mỗi Tuần',
      subtitle: 'Miễn phí giao hàng toàn quốc từ 250k. Nhận voucher giảm ngay 15% cho đơn hàng đầu tiên cùng mã BOOK2026.',
      image: 'https://images.unsplash.com/photo-1507842229452-472d17208151?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Xem Sách Mới',
      ctaLink: '/books'
    },
    {
      badge: 'Cộng Đồng Đọc Sách',
      title: 'Nuôi Dưỡng Thói Quen Đọc Sách Tinh Hoa',
      subtitle: 'Giao lưu cùng tác giả, lắng nghe đánh giá chân thực từ độc giả và tư vấn thông minh từ trợ lý AI Gemini.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Tìm Hiểu Thêm',
      ctaLink: '/about'
    }
  ];

  ngOnInit(): void {
    this.startSlideShow();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide(): void {
    this.currentSlide.update(idx => (idx + 1) % this.heroSlides.length);
  }

  prevSlide(): void {
    this.currentSlide.update(idx => (idx - 1 + this.heroSlides.length) % this.heroSlides.length);
  }

  goToSlide(idx: number): void {
    this.currentSlide.set(idx);
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.loadWishlist(),
        this.loadCategories(),
      ]);
      await this.loadBooks();
    } catch (err) {
      console.error('Lỗi nạp dữ liệu trang chủ:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadWishlist(): Promise<void> {
    if (this.authService.isAuthenticated) {
      try {
        const ids = await firstValueFrom(this.wishlistService.getMyWishlistBookIds());
        this.wishlistBookIds.set(new Set(ids || []));
      } catch (e) {
        console.error('Lỗi tải danh sách yêu thích:', e);
      }
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const res = await firstValueFrom(this.categoryService.getList({ maxResultCount: 6, skipCount: 0 }));
      const icons = ['fa-graduation-cap', 'fa-magic', 'fa-heart', 'fa-landmark', 'fa-laptop-code', 'fa-palette'];
      const mapped = (res.items || []).map((c, i) => ({
        id: c.id || '',
        name: c.name || '',
        icon: icons[i % icons.length],
        count: (c as any).bookCount || 12
      }));
      this.categories.set(mapped);
    } catch (e) {
      console.error('Lỗi tải danh mục:', e);
    }
  }

  async loadBooks(): Promise<void> {
    try {
      const res = await firstValueFrom(this.bookService.getList({ maxResultCount: 50, skipCount: 0 }));
      const allBooks = res.items || [];
      const wishlisted = this.wishlistBookIds();

      // Transform to StorefrontBook
      const transformed: StorefrontBook[] = allBooks.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        categoryName: b.categoryName || 'Sách tổng hợp',
        categoryId: b.categoryId,
        publishDate: b.publishDate,
        price: b.price || 0,
        discountPrice: b.originalPrice && b.originalPrice > b.price ? b.price : undefined,
        authorId: b.authorId,
        authorName: b.authorName,
        coverImage: b.coverImage,
        stockCount: b.stockCount ?? 10,
        averageRating: 5,
        reviewCount: 0,
        ageLimit: formatAgeLimit(b.ageLimit),
        isWishlisted: wishlisted.has(b.id)
      }));

      // Enrich reviews for top books
      const topBooks = transformed.slice(0, 8);
      await Promise.all(topBooks.map(async (book) => {
        try {
          const sum = await firstValueFrom(this.reviewService.getSummary(book.id));
          if (sum) {
            book.averageRating = sum.averageRating || 5;
            book.reviewCount = sum.totalReviews || 0;
          }
        } catch { }
      }));

      // Featured: highest price / rating
      this.featuredBooks.set(topBooks.slice(0, 4));
      // New arrivals: remaining
      this.newArrivalBooks.set(transformed.slice(4, 12));
    } catch (err) {
      console.error('Lỗi nạp sách:', err);
    }
  }

  async onAddToCart(book: StorefrontBook): Promise<void> {
    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      this.authService.navigateToLogin();
      return;
    }
    try {
      await this.cartStore.addToCart(book.id, 1);
      this.toastService.showSuccess(`Đã thêm "${book.name}" vào giỏ hàng!`);
    } catch (e) {
      this.toastService.showError('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  }

  async onToggleFavorite(book: StorefrontBook): Promise<void> {
    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để lưu sách yêu thích');
      this.authService.navigateToLogin();
      return;
    }
    try {
      const isFav = await firstValueFrom(this.wishlistService.toggleWishlist(book.id));
      const current = this.wishlistBookIds();
      if (isFav) {
        current.add(book.id);
        this.toastService.showSuccess(`Đã lưu "${book.name}" vào danh sách yêu thích!`);
      } else {
        current.delete(book.id);
        this.toastService.showInfo(`Đã bỏ "${book.name}" khỏi danh sách yêu thích.`);
      }
      this.wishlistBookIds.set(new Set(current));

      // Cập nhật immutably Signals để kích hoạt Change Detection cho các BookCard
      this.featuredBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: isFav } : b));
      this.newArrivalBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: isFav } : b));
    } catch (e) {
      this.toastService.showError('Không thể cập nhật danh sách yêu thích.');
      this.featuredBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: book.isWishlisted } : b));
      this.newArrivalBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: book.isWishlisted } : b));
    }
  }

  onCategorySelect(catId: string): void {
    this.router.navigate(['/books'], { queryParams: { categoryId: catId } });
  }

  onViewDetail(bookId: string): void {
    this.router.navigate(['/books', bookId]);
  }
}
