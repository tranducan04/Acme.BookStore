import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../models/storefront.models';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1"
          [ngClass]="badgeClass()">
      <i [class]="badgeIcon()"></i>
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge {
      font-size: 0.8rem;
      letter-spacing: 0.2px;
    }
  `]
})
export class OrderStatusBadgeComponent {
  status = input.required<OrderStatus | number | string>();

  normalizedStatus = computed(() => {
    const raw = this.status();
    if (typeof raw === 'number') {
      switch (raw) {
        case 0: return 'Placed';
        case 1: return 'Processing';
        case 2: return 'Shipped';
        case 3: return 'Completed';
        case 4: return 'Cancelled';
        default: return 'Processing';
      }
    }
    return String(raw);
  });

  badgeClass = computed(() => {
    switch (this.normalizedStatus()) {
      case 'Placed': return 'bg-info-subtle text-info border border-info-subtle';
      case 'Processing': return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'Shipped': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'Completed': return 'bg-success-subtle text-success border border-success-subtle';
      case 'Cancelled': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary';
    }
  });

  badgeIcon = computed(() => {
    switch (this.normalizedStatus()) {
      case 'Placed': return 'fas fa-receipt';
      case 'Processing': return 'fas fa-cog fa-spin';
      case 'Shipped': return 'fas fa-shipping-fast';
      case 'Completed': return 'fas fa-check-circle';
      case 'Cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  });

  label = computed(() => {
    switch (this.normalizedStatus()) {
      case 'Placed': return 'Đã đặt hàng';
      case 'Processing': return 'Đang xử lý';
      case 'Shipped': return 'Đang giao hàng';
      case 'Completed': return 'Đã hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return 'Đang xử lý';
    }
  });
}
