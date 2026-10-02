import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="price-tag-wrapper d-inline-flex align-items-center gap-2 flex-wrap">
      @if (discountPrice() && discountPrice()! < price()) {
        <span class="current-price fw-bold text-primary fs-5">
          {{ formatCurrency(discountPrice()!) }}
        </span>
        <span class="original-price text-muted text-decoration-line-through fs-7">
          {{ formatCurrency(price()) }}
        </span>
        @if (showBadge() && discountPercent() > 0) {
          <span class="badge bg-danger rounded-pill px-2 py-1 fs-8">
            -{{ discountPercent() }}%
          </span>
        }
      } @else {
        <span class="current-price fw-bold text-primary fs-5">
          {{ formatCurrency(price()) }}
        </span>
      }
    </div>
  `,
  styles: [`
    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.72rem; }
    .current-price {
      letter-spacing: -0.3px;
    }
  `]
})
export class PriceTagComponent {
  price = input.required<number>();
  discountPrice = input<number | undefined>(undefined);
  showBadge = input<boolean>(true);

  discountPercent = computed(() => {
    const orig = this.price();
    const disc = this.discountPrice();
    if (disc && orig > 0 && disc < orig) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return 0;
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  }
}
