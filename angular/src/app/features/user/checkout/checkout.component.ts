import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@abp/ng.core';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { OrderService } from '../../../proxy/orders/order.service';
import { PaymentService } from '../../../proxy/payments/payment.service';
import { PaymentMethod } from '../../../proxy/orders/payment-method.enum';
import { ToastService } from '../../../shared/services/toast.service';
import { CouponValidationResultDto } from '../../../proxy/coupons/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  readonly cartStore = inject(CartSignalStore);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  // Form Fields
  readonly receiverName = signal<string>('');
  readonly receiverPhone = signal<string>('');
  readonly deliveryAddress = signal<string>('');
  readonly orderNote = signal<string>('');
  readonly selectedPaymentMethod = signal<PaymentMethod>(PaymentMethod.COD);

  // Validation Errors
  readonly nameError = signal<string>('');
  readonly phoneError = signal<string>('');
  readonly addressError = signal<string>('');

  // Order Placement & QR State
  readonly isPlacingOrder = signal<boolean>(false);
  readonly appliedCoupon = signal<CouponValidationResultDto | null>(null);
  readonly createdOrder = signal<any | null>(null);
  readonly qrCodeUrl = signal<string | null>(null);
  readonly showQrModal = signal<boolean>(false);

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

  readonly PaymentMethodEnum = PaymentMethod;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để tiến hành đặt hàng.');
      this.authService.navigateToLogin();
      return;
    }

    this.cartStore.loadCart();

    // Check applied coupon from localStorage
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('applied_coupon');
      if (saved) {
        try {
          this.appliedCoupon.set(JSON.parse(saved));
        } catch {}
      }
    }
  }

  validateForm(): boolean {
    let valid = true;

    // 1. Tên người nhận
    const name = this.receiverName().trim();
    if (!name) {
      this.nameError.set('Họ và tên người nhận không được để trống.');
      valid = false;
    } else if (name.length < 2 || name.length > 100) {
      this.nameError.set('Họ và tên người nhận phải từ 2 đến 100 ký tự.');
      valid = false;
    } else {
      this.nameError.set('');
    }

    // 2. Số điện thoại (10 chữ số VN)
    const phone = this.receiverPhone().trim();
    const phoneRegex = /^0(3|5|7|8|9)[0-9]{8}$/;
    if (!phone) {
      this.phoneError.set('Số điện thoại nhận hàng không được để trống.');
      valid = false;
    } else if (!phoneRegex.test(phone)) {
      this.phoneError.set('Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09).');
      valid = false;
    } else {
      this.phoneError.set('');
    }

    // 3. Địa chỉ nhận hàng
    const address = this.deliveryAddress().trim();
    if (!address) {
      this.addressError.set('Địa chỉ giao hàng không được để trống.');
      valid = false;
    } else if (address.length < 10) {
      this.addressError.set('Vui lòng nhập địa chỉ cụ thể hơn (tối thiểu 10 ký tự).');
      valid = false;
    } else {
      this.addressError.set('');
    }

    return valid;
  }

  async confirmOrder(): Promise<void> {
    if (!this.validateForm()) {
      this.toastService.showWarning('Vui lòng kiểm tra lại thông tin nhận hàng.');
      return;
    }

    const items = this.cartStore.cart()?.items;
    if (!items || items.length === 0) {
      this.toastService.showWarning('Giỏ hàng rỗng, không thể tạo đơn hàng.');
      this.router.navigate(['/cart']);
      return;
    }

    this.isPlacingOrder.set(true);
    try {
      const fullAddress = this.orderNote() 
        ? `${this.deliveryAddress().trim()} (Ghi chú: ${this.orderNote().trim()})`
        : this.deliveryAddress().trim();

      const orderResult = await firstValueFrom(this.orderService.post({
        receiverName: this.receiverName().trim(),
        receiverPhone: this.receiverPhone().trim(),
        shippingAddress: fullAddress,
        paymentMethod: this.selectedPaymentMethod()
      }));

      this.createdOrder.set(orderResult);
      // Xóa coupon sau khi đặt
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('applied_coupon');
      }

      // Refresh cart
      await this.cartStore.loadCart(true);

      if (this.selectedPaymentMethod() === PaymentMethod.VietQR) {
        // Generate VietQR
        try {
          const qrRes = await firstValueFrom(this.paymentService.createVietQrPayment({
            orderId: orderResult.id,
            amount: this.grandTotal(),
            paymentMethod: 'VietQR'
          }));
          if (qrRes?.qrCodeUrl) {
            this.qrCodeUrl.set(qrRes.qrCodeUrl);
          } else {
            // Fallback VietQR template
            const fallbackQr = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${this.grandTotal()}&addInfo=ORD%20${orderResult.orderNo || orderResult.id?.substring(0, 8)}&accountName=ACME%20BOOKSTORE`;
            this.qrCodeUrl.set(fallbackQr);
          }
          this.showQrModal.set(true);
          this.toastService.showSuccess('Đơn hàng đã được tạo! Vui lòng quét mã VietQR để hoàn tất.');
        } catch {
          const fallbackQr = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${this.grandTotal()}&addInfo=ORD%20${orderResult.orderNo || orderResult.id?.substring(0, 8)}&accountName=ACME%20BOOKSTORE`;
          this.qrCodeUrl.set(fallbackQr);
          this.showQrModal.set(true);
          this.toastService.showSuccess('Đơn hàng đã được tạo! Vui lòng quét mã VietQR.');
        }
      } else {
        this.toastService.showSuccess('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
        this.router.navigate(['/my-orders']);
      }

    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err);
      this.toastService.showError(err?.error?.error?.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      this.isPlacingOrder.set(false);
    }
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
    this.router.navigate(['/my-orders']);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  }
}
