import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrderService } from '../../../proxy/orders/order.service';
import { PaymentService } from '../../../proxy/payments/payment.service';
import { OrderDto } from '../../../proxy/orders/models';
import { OrderStatus } from '../../../proxy/orders/order-status.enum';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { ToastService } from '../../../shared/services/toast.service';
import { OrderTimelineStep } from '../../../shared/models/storefront.models';
import { OrderStatusBadgeComponent } from '../../../shared/components/storefront/order-status-badge/order-status-badge.component';
import { OrderTimelineComponent } from '../../../shared/components/storefront/order-timeline/order-timeline.component';
import { EmptyStateComponent } from '../../../shared/components/storefront/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    OrderStatusBadgeComponent,
    OrderTimelineComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly cartStore = inject(CartSignalStore);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly orders = signal<OrderDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedTab = signal<number>(-1); // -1: Tất cả, 0: Placed, 1: Processing, 2: Shipped, 3: Completed, 4: Cancelled
  readonly searchKeyword = signal<string>('');

  // Selected Order for Modal / VietQR
  readonly selectedOrderForQr = signal<OrderDto | null>(null);
  readonly qrCodeUrl = signal<string | null>(null);
  readonly isQrModalOpen = signal<boolean>(false);
  readonly isCancelling = signal<string | null>(null);

  readonly statusTabs = [
    { label: 'Tất cả đơn', value: -1, count: 0 },
    { label: 'Đã đặt hàng', value: 0, count: 0 },
    { label: 'Đang xử lý', value: 1, count: 0 },
    { label: 'Đang giao hàng', value: 2, count: 0 },
    { label: 'Đã hoàn thành', value: 3, count: 0 },
    { label: 'Đã hủy', value: 4, count: 0 }
  ];

  readonly filteredOrders = computed(() => {
    let list = this.orders();
    const tab = this.selectedTab();
    const kw = this.searchKeyword().trim().toLowerCase();

    if (tab !== -1) {
      list = list.filter(o => o.status === tab);
    }

    if (kw) {
      list = list.filter(o => 
        o.orderNo?.toLowerCase().includes(kw) ||
        o.receiverName?.toLowerCase().includes(kw) ||
        o.receiverPhone?.includes(kw)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['orderNo']) {
        this.searchKeyword.set(params['orderNo']);
      }
      if (params['status'] !== undefined) {
        this.selectedTab.set(parseInt(params['status'], 10));
      }
    });

    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.orderService.getMyOrders({ maxResultCount: 100, skipCount: 0 }));
      this.orders.set(res.items || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
      this.toastService.showError('Không thể nạp danh sách đơn hàng.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getOrderTimelineSteps(order: OrderDto): OrderTimelineStep[] {
    const currentStatus = order.status ?? 0;
    const isCancelled = currentStatus === 4;

    if (isCancelled) {
      return [
        {
          stepIndex: 1,
          status: 'Placed',
          title: 'Đã đặt hàng',
          description: 'Khách hàng tạo đơn',
          isCurrent: false,
          isCompleted: true
        },
        {
          stepIndex: 2,
          status: 'Cancelled',
          title: 'Đã hủy đơn',
          description: 'Đơn hàng đã bị hủy bỏ',
          isCurrent: true,
          isCompleted: false
        }
      ];
    }

    return [
      {
        stepIndex: 1,
        status: 'Placed',
        title: 'Đặt hàng',
        description: 'Tạo đơn thành công',
        isCurrent: currentStatus === 0,
        isCompleted: currentStatus > 0
      },
      {
        stepIndex: 2,
        status: 'Processing',
        title: 'Xử lý',
        description: 'Đóng gói bưu phẩm',
        isCurrent: currentStatus === 1,
        isCompleted: currentStatus > 1
      },
      {
        stepIndex: 3,
        status: 'Shipped',
        title: 'Đang giao',
        description: 'Bàn giao đơn vị vận chuyển',
        isCurrent: currentStatus === 2,
        isCompleted: currentStatus > 2
      },
      {
        stepIndex: 4,
        status: 'Completed',
        title: 'Hoàn thành',
        description: 'Đã nhận hàng thành công',
        isCurrent: currentStatus === 3,
        isCompleted: currentStatus >= 3
      }
    ];
  }

  async openVietQrModal(order: OrderDto): Promise<void> {
    this.selectedOrderForQr.set(order);
    this.isQrModalOpen.set(true);
    this.qrCodeUrl.set(null);

    try {
      const qrRes = await firstValueFrom(this.paymentService.createVietQrPayment({
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: 'VietQR'
      }));
      if (qrRes?.qrCodeUrl) {
        this.qrCodeUrl.set(qrRes.qrCodeUrl);
      } else {
        const fallbackQr = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${order.totalAmount}&addInfo=ORD%20${order.orderNo || order.id?.substring(0, 8)}&accountName=ACME%20BOOKSTORE`;
        this.qrCodeUrl.set(fallbackQr);
      }
    } catch {
      const fallbackQr = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${order.totalAmount}&addInfo=ORD%20${order.orderNo || order.id?.substring(0, 8)}&accountName=ACME%20BOOKSTORE`;
      this.qrCodeUrl.set(fallbackQr);
    }
  }

  closeQrModal(): void {
    this.isQrModalOpen.set(false);
    this.selectedOrderForQr.set(null);
  }

  async cancelOrder(orderId?: string): Promise<void> {
    if (!orderId) return;
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    this.isCancelling.set(orderId);
    try {
      await firstValueFrom(this.orderService.cancelMyOrder(orderId));
      this.toastService.showSuccess('Đã hủy đơn hàng thành công.');
      await this.loadOrders();
    } catch (err: any) {
      this.toastService.showError(err?.error?.error?.message || 'Không thể hủy đơn hàng vào lúc này.');
    } finally {
      this.isCancelling.set(null);
    }
  }

  async reorder(order: OrderDto): Promise<void> {
    if (!order.items || order.items.length === 0) return;
    try {
      for (const item of order.items) {
        if (item.bookId) {
          await this.cartStore.addToCart(item.bookId, item.count || 1);
        }
      }
      this.toastService.showSuccess('Đã thêm các cuốn sách trong đơn hàng vào giỏ!');
      this.router.navigate(['/cart']);
    } catch {
      this.toastService.showError('Không thể thêm lại vào giỏ hàng.');
    }
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  }
}
