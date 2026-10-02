import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, PermissionService } from '@abp/ng.core';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { WishlistItemDto, FavoriteBookStatDto } from '../../../proxy/wishlists/models';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { ToastService } from '../../../shared/services/toast.service';
import { StorefrontBook } from '../../../shared/models/storefront.models';
import { BookCardComponent } from '../../../shared/components/storefront/book-card/book-card.component';
import { EmptyStateComponent } from '../../../shared/components/storefront/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookCardComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly permission = inject(PermissionService);
  readonly cartStore = inject(CartSignalStore);
  private readonly toastService = inject(ToastService);

  readonly wishlistItems = signal<WishlistItemDto[]>([]);
  readonly adminFavoriteBooks = signal<FavoriteBookStatDto[]>([]);
  readonly isLoading = signal<boolean>(false);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get isAdminOrAuthor(): boolean {
    return this.permission.getGrantedPolicy('BookStore.Books.Create') ||
           this.permission.getGrantedPolicy('BookStore.Books.Edit');
  }

  ngOnInit(): void {
    if (!this.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để xem danh sách sách yêu thích của bạn.');
      this.authService.navigateToLogin();
      return;
    }
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      if (this.isAdminOrAuthor) {
        const topBooks = await firstValueFrom(this.wishlistService.getTopFavoriteBooks());
        this.adminFavoriteBooks.set(topBooks || []);
      } else {
        const items = await firstValueFrom(this.wishlistService.getMyWishlist());
        this.wishlistItems.set(items || []);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu yêu thích:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  toStorefrontBook(item: WishlistItemDto): StorefrontBook {
    return {
      id: item.bookId || '',
      name: item.bookName || '',
      type: 0,
      publishDate: item.creationTime || new Date().toISOString(),
      price: item.price || 0,
      coverImage: item.coverImage || undefined,
      stockCount: 15,
      averageRating: 5,
      reviewCount: 0,
      isWishlisted: true
    };
  }

  async removeItem(bookId?: string): Promise<void> {
    if (!bookId) return;
    try {
      await firstValueFrom(this.wishlistService.toggleWishlist(bookId));
      this.wishlistItems.update(items => items.filter(x => x.bookId !== bookId));
      this.toastService.showInfo('Đã bỏ sách khỏi danh sách yêu thích.');
    } catch (err) {
      this.toastService.showError('Không thể xóa khỏi yêu thích.');
    }
  }

  async addToCart(book: StorefrontBook): Promise<void> {
    try {
      await this.cartStore.addToCart(book.id, 1);
      this.toastService.showSuccess(`Đã thêm "${book.name}" vào giỏ hàng!`);
    } catch {
      this.toastService.showError('Không thể thêm vào giỏ hàng.');
    }
  }

  viewDetail(bookId: string): void {
    this.router.navigate(['/books', bookId]);
  }
}
