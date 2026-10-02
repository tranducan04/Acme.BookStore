import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartSignalStore } from './cart-signal.store';
import { CouponService } from '../../../proxy/coupons/coupon.service';
import { CouponValidationResultDto } from '../../../proxy/coupons/models';
import { ToastService } from '../../../shared/services/toast.service';
import { PriceTagComponent } from '../../../shared/components/storefront/price-tag/price-tag.component';
import { QuantitySelectorComponent } from '../../../shared/components/storefront/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '../../../shared/components/storefront/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    QuantitySelectorComponent,
    EmptyStateComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  readonly cartStore = inject(CartSignalStore);
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);
  readonly router = inject(Router);

  // Coupon state
  readonly couponInput = signal<string>('');
  readonly appliedCoupon = signal<CouponValidationResultDto | null>(null);
  readonly isApplyingCoupon = signal<boolean>(false);

  // Calculations
  readonly subtotal = computed(() => this.cartStore.cart()?.totalPrice || 0);

  readonly shippingFee = computed(() => {
    const raw = this.subtotal();
    if (raw === 0) return 0;
    return raw >= 250000 ? 0 : 30000;
  });

  readonly discountAmount = computed(() => this.appliedCoupon()?.discountAmount || 0);

  readonly grandTotal = computed(() => {
    const total = this.subtotal() - this.discountAmount() + this.shippingFee();
    return Math.max(0, total);
  });

  ngOnInit(): void {
    this.cartStore.loadCart();
  }

  async updateItemQuantity(bookId: string | undefined, count: number): Promise<void> {
    if (!bookId) return;
    await this.cartStore.updateCount(bookId, count);
    // If a coupon is applied, revalidate it with new total
    if (this.appliedCoupon()) {
      this.revalidateCoupon();
    }
  }

  async removeItem(bookId: string | undefined): Promise<void> {
    if (!bookId) return;
    await this.cartStore.removeItem(bookId);
    if (this.appliedCoupon()) {
      this.revalidateCoupon();
    }
  }

  async applyCoupon(): Promise<void> {
    const code = this.couponInput().trim().toUpperCase();
    if (!code) {
      this.toastService.showWarning('Vui lòng nhập mã giảm giá.');
      return;
    }

    this.isApplyingCoupon.set(true);
    try {
      const result = await firstValueFrom(this.couponService.validateCoupon({
        code,
        orderTotal: this.subtotal()
      }));

      if (result.isValid) {
        this.appliedCoupon.set(result);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('applied_coupon', JSON.stringify(result));
        }
        this.toastService.showSuccess(`Áp dụng mã ${code} thành công! Tiết kiệm ${this.formatCurrency(result.discountAmount)}.`);
      } else {
        this.toastService.showError(result.errorMessage || 'Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.');
      }
    } catch {
      this.toastService.showError('Không thể kiểm tra mã giảm giá, vui lòng thử lại.');
    } finally {
      this.isApplyingCoupon.set(false);
    }
  }

  private async revalidateCoupon(): Promise<void> {
    const current = this.appliedCoupon();
    if (!current?.code) return;
    try {
      const res = await firstValueFrom(this.couponService.validateCoupon({
        code: current.code,
        orderTotal: this.subtotal()
      }));
      if (res.isValid) {
        this.appliedCoupon.set(res);
      } else {
        this.removeCoupon();
        this.toastService.showWarning('Mã giảm giá đã bị hủy do tổng đơn hàng không còn đủ điều kiện.');
      }
    } catch {}
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponInput.set('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('applied_coupon');
    }
    this.toastService.showInfo('Đã gỡ bỏ mã giảm giá.');
  }

  proceedToCheckout(): void {
    if (!this.cartStore.cart()?.items?.length) {
      this.toastService.showWarning('Giỏ hàng của bạn đang trống.');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  }
}
