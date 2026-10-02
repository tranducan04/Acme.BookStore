import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quantity-selector-group d-inline-flex align-items-center border rounded-pill bg-light p-1">
      <button type="button"
              class="btn btn-sm btn-icon rounded-circle d-flex align-items-center justify-content-center border-0"
              [disabled]="quantity() <= min()"
              (click)="decrease()"
              aria-label="Giảm số lượng">
        <i class="fas fa-minus fs-8"></i>
      </button>

      <span class="quantity-value px-3 fw-bold fs-6 text-center" style="min-width: 36px;">
        {{ quantity() }}
      </span>

      <button type="button"
              class="btn btn-sm btn-icon rounded-circle d-flex align-items-center justify-content-center border-0"
              [disabled]="quantity() >= max()"
              (click)="increase()"
              aria-label="Tăng số lượng">
        <i class="fas fa-plus fs-8"></i>
      </button>
    </div>
  `,
  styles: [`
    .quantity-selector-group {
      background-color: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
    }
    .fs-8 { font-size: 0.72rem; }
    .btn-icon {
      width: 28px;
      height: 28px;
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
      &:hover:not(:disabled) {
        background: #1e40af;
        color: #ffffff;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
    :host-context([data-theme="dark"]) {
      .quantity-selector-group {
        background: #1e293b !important;
        border-color: #334155 !important;
      }
      .btn-icon {
        background: #0b1329 !important;
        color: #f8fafc !important;
        &:hover:not(:disabled) {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
      }
      .quantity-value {
        color: #f8fafc !important;
      }
    }
  `]
})
export class QuantitySelectorComponent {
  quantity = input<number>(1);
  min = input<number>(1);
  max = input<number>(99);

  quantityChange = output<number>();

  decrease(): void {
    if (this.quantity() > this.min()) {
      this.quantityChange.emit(this.quantity() - 1);
    }
  }

  increase(): void {
    if (this.quantity() < this.max()) {
      this.quantityChange.emit(this.quantity() + 1);
    }
  }
}
