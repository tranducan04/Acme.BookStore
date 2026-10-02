import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@abp/ng.core';
import { StorefrontBook } from '../../../models/storefront.models';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { PriceTagComponent } from '../price-tag/price-tag.component';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent, PriceTagComponent],
  template: `
    <div class="card storefront-book-card h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column cursor-pointer"
         (click)="onCardClick($event)">
      
      <!-- Bìa Sách (Cover Container) - Chiều cao cố định, ảnh fill 100%, không khoảng hở -->
      <div class="book-cover-wrapper position-relative overflow-hidden">
        
        <!-- Wishlist Heart Button -->
        @if (showFavoriteBtn()) {
          <button type="button"
                  class="btn-wishlist-toggle rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm position-absolute top-0 end-0 card-badge-pos z-2"
                  [class.active]="isWishlisted()"
                  (click)="onToggleFavorite($event)"
                  [title]="isWishlisted() ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'"
                  aria-label="Yêu thích">
            <i class="fas fa-heart fs-7" [class.text-danger]="isWishlisted()" [class.text-muted]="!isWishlisted()"></i>
          </button>
        }

        <!-- Badge Độ tuổi / Khuyến mãi -->
        @if (book().ageLimit) {
          <span class="badge bg-primary text-white position-absolute top-0 start-0 card-badge-pos z-2 rounded-pill px-2.5 py-1 fs-9 fw-bold shadow-sm">
            {{ book().ageLimit }}
          </span>
        }

        <!-- Badge Hết hàng -->
        @if (book().stockCount <= 0) {
          <span class="badge bg-danger text-white position-absolute bottom-0 end-0 card-badge-pos z-2 rounded-pill px-2.5 py-1 fs-9 fw-bold shadow-sm">
            Hết hàng
          </span>
        }

        <a [routerLink]="['/books', book().id]"
           (click)="onViewDetail($event)"
           class="d-block book-cover-link">
          <img [src]="book().coverImage || defaultCover"
               [alt]="book().name"
               loading="lazy"
               class="book-cover-img"
               (error)="onImageError($event)">
        </a>
      </div>

      <!-- Thông tin Sách - Nằm sát ngay dưới ảnh bìa, không có khoảng cách thừa -->
      <div class="card-body p-3 d-flex flex-column flex-grow-1">
        <!-- Thể loại -->
        @if (book().categoryName) {
          <div class="book-category text-primary fs-8 fw-semibold text-uppercase mb-1">
            {{ book().categoryName }}
          </div>
        }

        <!-- Tên Sách -->
        <h6 class="book-title fw-bold text-dark mb-1 lh-sm" [title]="book().name">
          <a [routerLink]="['/books', book().id]" (click)="onViewDetail($event)" class="text-decoration-none text-dark hover-primary">
            {{ book().name }}
          </a>
        </h6>

        <!-- Đánh giá sao (Chỉ hiển thị đánh giá average) -->
        <div class="d-flex align-items-center mb-2">
          <app-star-rating [rating]="book().averageRating || 5" [readOnly]="true" [showScore]="true" />
        </div>

        <!-- Khối giá & Nút mua (Luôn neo đáy thẻ bằng mt-auto) -->
        <div class="mt-auto pt-1">
          <!-- Giá tiền -->
          <div class="mb-2">
            <app-price-tag [price]="book().price" [discountPrice]="book().discountPrice" />
          </div>

          <!-- Nút Thêm vào giỏ -->
          <button type="button"
                  class="btn w-100 py-2 rounded-pill fw-semibold fs-7 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  [ngClass]="book().stockCount > 0 ? 'btn-primary' : 'btn-secondary text-white'"
                  [disabled]="book().stockCount <= 0"
                  (click)="onAddToCart($event)">
            <i class="fas" [ngClass]="book().stockCount > 0 ? 'fa-cart-plus' : 'fa-ban'"></i>
            <span>{{ book().stockCount > 0 ? 'Thêm vào giỏ' : 'Hết hàng' }}</span>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .storefront-book-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      background-color: #ffffff;
      border: 1px solid #f1f5f9 !important;
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 30px -10px rgba(30, 64, 175, 0.15) !important;
        border-color: #bfdbfe !important;
        .book-cover-img {
          transform: scale(1.05);
        }
      }
    }

    .book-cover-wrapper {
      height: 220px;
      width: 100%;
      background-color: #f1f5f9;
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }

    .book-cover-link {
      width: 100%;
      height: 100%;
    }

    .book-cover-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: transform 0.4s ease;
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }

    .card-badge-pos {
      margin: 0.65rem !important;
    }

    .btn-wishlist-toggle {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
      &:hover {
        background: #ffffff;
        transform: scale(1.15);
      }
    }

    .book-title {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.25;
      margin-bottom: 0.35rem;
    }

    .book-category {
      font-size: 0.72rem;
      letter-spacing: 0.4px;
      margin-bottom: 2px;
    }

    .hover-primary:hover {
      color: #1e40af !important;
    }

    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.75rem; }
    .fs-9 { font-size: 0.65rem; }

    :host-context([data-theme="dark"]) {
      .storefront-book-card {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        &:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 16px 30px -10px rgba(0, 0, 0, 0.5) !important;
        }
      }
      .book-cover-wrapper {
        background-color: #0b1329 !important;
      }
      .text-dark { color: #f8fafc !important; }
      .text-secondary { color: #94a3b8 !important; }
      .btn-wishlist-toggle {
        background: rgba(17, 28, 68, 0.85) !important;
      }
    }
  `]
})
export class BookCardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  book = input.required<StorefrontBook>();
  showFavoriteBtn = input<boolean>(true);

  addToCart = output<StorefrontBook>();
  toggleFavorite = output<StorefrontBook>();
  viewDetail = output<string>();

  isWishlisted = signal<boolean>(false);

  defaultCover: string = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60';

  constructor() {
    effect(() => {
      this.isWishlisted.set(!!this.book()?.isWishlisted);
    }, { allowSignalWrites: true });
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    if (this.book().stockCount <= 0) return;
    this.addToCart.emit(this.book());
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.authService.isAuthenticated) {
      this.isWishlisted.update(v => !v);
    }
    this.toggleFavorite.emit(this.book());
  }

  onViewDetail(event: Event): void {
    event.stopPropagation();
    this.viewDetail.emit(this.book().id);
    this.router.navigate(['/books', this.book().id]);
  }

  onCardClick(event: Event): void {
    this.onViewDetail(event);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.defaultCover;
    }
  }
}
