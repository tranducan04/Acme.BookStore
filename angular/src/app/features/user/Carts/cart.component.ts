import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { CartSignalStore } from './cart-signal.store';
import { OrderService } from '../../../proxy/orders/order.service';
import { PaymentService } from '../../../proxy/payments/payment.service';
import { CouponService } from '../../../proxy/coupons/coupon.service';
import { CouponValidationResultDto } from '../../../proxy/coupons/models';
import { computed } from '@angular/core';

import { CoreModule } from '@abp/ng.core';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  imports: [CommonModule, FormsModule, RouterModule, CoreModule],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  public cartStore = inject(CartSignalStore);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private couponService = inject(CouponService);
  private router = inject(Router);

  // Form Signals
  public receiverName = signal<string>('');
  public receiverPhone = signal<string>('');
  public shippingAddress = signal<string>('');
  public paymentMethod = signal<number>(0);
  public isOrdering = signal<boolean>(false);
  public isCheckoutModalOpen = signal<boolean>(false);
  public showCheckoutModal = this.isCheckoutModalOpen;
  public nameError = signal<string>('');
  public phoneError = signal<string>('');
  public addressError = signal<string>('');

  // 🎟️ COUPON SIGNALS
  public couponInput = signal<string>('');
  public appliedCoupon = signal<CouponValidationResultDto | null>(null);
  public isApplyingCoupon = signal<boolean>(false);
  public couponError = signal<string>('');
  public couponSuccess = signal<string>('');

  public discountAmount = computed(() => this.appliedCoupon()?.discountAmount || 0);
  public finalPrice = computed(() => {
    const raw = this.cartStore.cart()?.totalPrice || 0;
    return Math.max(0, raw - this.discountAmount());
  });

  // VietQR Signals
  public isQrModalOpen = signal<boolean>(false);
  public qrCodeUrl = signal<string>('');
  public createdOrderNo = signal<string>('');
  public createdOrderId = signal<string>('');
  public createdOrderAmount = signal<number>(0);

  // 2. Các hàm kiểm tra dữ liệu từng ô
  validateName(val: string): boolean {
    const name = val.trim();
    if (!name) {
      this.nameError.set('⚠️ Họ và tên người nhận không được để trống!');
      return false;
    } else if (name.length < 2) {
      this.nameError.set('⚠️ Họ và tên phải có tối thiểu 2 ký tự!');
      return false;
    }
    this.nameError.set('');
    return true;
  }
  validatePhone(val: string): boolean {
    const phone = val.trim();
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phone) {
      this.phoneError.set('⚠️ Số điện thoại không được để trống!');
      return false;
    } else if (!phoneRegex.test(phone)) {
      this.phoneError.set('⚠️ Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (VD: 0912345678).');
      return false;
    }
    this.phoneError.set('');
    return true;
  }
  validateAddress(val: string): boolean {
    const address = val.trim();
    if (!address) {
      this.addressError.set('⚠️ Địa chỉ giao hàng không được để trống!');
      return false;
    } else if (address.length < 5) {
      this.addressError.set('⚠️ Địa chỉ quá ngắn! Vui lòng nhập chi tiết (tối thiểu 5 ký tự).');
      return false;
    }
    this.addressError.set('');
    return true;
  }

  ngOnInit(): void {
    this.cartStore.loadCart();
  }

  async updateQuantity(bookId: string, currentCount: number, delta: number) {
    const newCount = currentCount + delta;
    await this.cartStore.updateCount(bookId, newCount);
  }

  openCheckout() {
    this.nameError.set('');
    this.phoneError.set('');
    this.addressError.set('');
    this.isOrdering.set(false);
    this.isCheckoutModalOpen.set(true);
  }
  closeCheckout() {
    this.nameError.set('');
    this.phoneError.set('');
    this.addressError.set('');
    this.isOrdering.set(false);
    this.isCheckoutModalOpen.set(false);
  }


  closeQrModal() {
    this.isQrModalOpen.set(false);
    this.createdOrderId.set('');
    this.createdOrderNo.set('');
    this.removeCoupon();
    this.cartStore.loadCart();
    this.router.navigate(['/orders']);
  }

  async removeItem(bookId: string) {
    await this.cartStore.updateCount(bookId, 0);
  }

  onInput(field: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (field === 'receiverName') {
      this.receiverName.set(val);
      if (this.nameError()) this.nameError.set(''); // Xóa chữ đỏ khi đang nhập lại
    }
    if (field === 'receiverPhone') {
      this.receiverPhone.set(val);
      if (this.phoneError()) this.phoneError.set(''); // Xóa chữ đỏ khi đang nhập lại
    }
    if (field === 'shippingAddress') {
      this.shippingAddress.set(val);
      if (this.addressError()) this.addressError.set(''); // Xóa chữ đỏ khi đang nhập lại
    }
  }

  onPaymentMethodChange(event: Event) {
    const val = Number((event.target as HTMLSelectElement).value);
    this.paymentMethod.set(val);
  }
  async applyCoupon() {
    const code = this.couponInput().trim();
    if (!code) {
      this.couponError.set('Vui lòng nhập mã giảm giá.');
      this.couponSuccess.set('');
      return;
    }

    const currentTotal = this.cartStore.cart()?.totalPrice || 0;
    if (currentTotal <= 0) {
      this.couponError.set('Giỏ hàng chưa có sách để áp dụng mã.');
      return;
    }

    this.isApplyingCoupon.set(true);
    this.couponError.set('');
    this.couponSuccess.set('');

    try {
      const res = await firstValueFrom(this.couponService.validateCoupon({
        code: code,
        orderTotal: currentTotal
      }));

      if (res.isValid) {
        this.appliedCoupon.set(res);
        this.couponSuccess.set(`Áp dụng mã ${res.code} thành công: Giảm ${res.discountAmount.toLocaleString('vi-VN')}₫`);
        this.couponError.set('');
      } else {
        this.appliedCoupon.set(null);
        this.couponError.set(res.errorMessage || 'Mã giảm giá không hợp lệ.');
      }
    } catch (err: any) {
      const msg = err?.error?.error?.message || err?.message || 'Không thể kiểm tra mã giảm giá.';
      this.appliedCoupon.set(null);
      this.couponError.set(msg);
    } finally {
      this.isApplyingCoupon.set(false);
    }
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.couponInput.set('');
    this.couponError.set('');
    this.couponSuccess.set('');
  }

  async placeOrder() {
    await this.checkout();
  }

  async checkout() {
    const isNameValid = this.validateName(this.receiverName());
    const isPhoneValid = this.validatePhone(this.receiverPhone());
    const isAddressValid = this.validateAddress(this.shippingAddress());
    // Nếu có bất kỳ ô nào bị lỗi -> Dừng lại không cho gửi đơn
    if (!isNameValid || !isPhoneValid || !isAddressValid) {
      return;
    }

    // Trường hợp đơn đã tạo trước đó khi bật QR (user bấm Quay lại để chọn lại phương thức)
    const existingOrderId = this.createdOrderId();
    if (existingOrderId) {
      if (this.paymentMethod() === 0) {
        // Đổi sang COD
        this.isOrdering.set(true);
        try {
          await firstValueFrom(this.orderService.switchPaymentMethod(existingOrderId, 0));
          alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại Acme BookStore.');
          this.closeCheckout();
          this.createdOrderId.set('');
          this.createdOrderNo.set('');
          this.removeCoupon();
          await this.cartStore.loadCart();
          this.router.navigate(['/orders']);
        } catch (err: any) {
          console.error('Lỗi chuyển phương thức:', err);
          const msg = err?.error?.error?.message || err?.message || 'Có lỗi khi cập nhật phương thức thanh toán!';
          alert(`❌ ${msg}`);
        } finally {
          this.isOrdering.set(false);
        }
        return;
      } else {
        // Vẫn giữ QR -> Mở lại modal QR đã tạo
        this.closeCheckout();
        this.isQrModalOpen.set(true);
        return;
      }
    }

    const currentCart = this.cartStore.cart();
    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      alert('⚠️ Giỏ hàng của bạn đang trống! Vui lòng chọn sách trước khi đặt.');
      return;
    }
    this.isOrdering.set(true);
    try {
      const order: any = await firstValueFrom(this.orderService.post({
        receiverName: this.receiverName(),
        receiverPhone: this.receiverPhone(),
        shippingAddress: this.shippingAddress(),
        paymentMethod: this.paymentMethod(),
        couponCode: this.appliedCoupon()?.code || null
      } as any));

      const orderNo = order?.orderNo || `ORD-${Date.now()}`;
      const payableAmount = order?.totalAmount != null ? Number(order.totalAmount) : this.finalPrice();

      if (this.paymentMethod() === 1) {
        const defaultQr = `https://img.vietqr.io/image/970436-9394235730-compact2.png?amount=${payableAmount}&addInfo=${encodeURIComponent(orderNo)}&accountName=TRAN%20DUC%20AN`;
        this.qrCodeUrl.set(defaultQr);
        this.createdOrderNo.set(orderNo);
        this.createdOrderId.set(order?.id || '');
        this.createdOrderAmount.set(payableAmount);
        this.closeCheckout();
        this.isQrModalOpen.set(true);
      } else {
        alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại Acme BookStore.');
        this.closeCheckout();
        this.removeCoupon();
        await this.cartStore.loadCart();
        this.router.navigate(['/orders']);
      }
    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err);
      const errMsg = err?.error?.error?.message || err?.message || 'Có lỗi khi tạo đơn!';
      alert(`❌ Đặt hàng không thành công: ${errMsg}`);
    } finally {
      this.isOrdering.set(false);
    }
  }

  backToPaymentSelection() {
    this.isQrModalOpen.set(false);
    this.openCheckout();
  }

  async handleCancelCheckout() {
    const existingOrderId = this.createdOrderId();
    if (existingOrderId) {
      try {
        await firstValueFrom(this.orderService.cancelMyOrder(existingOrderId));
      } catch (e) {
        console.error('Lỗi khi hủy đơn:', e);
      }
      this.createdOrderId.set('');
      this.createdOrderNo.set('');
      await this.cartStore.loadCart();
    }
    this.closeCheckout();
  }
}
