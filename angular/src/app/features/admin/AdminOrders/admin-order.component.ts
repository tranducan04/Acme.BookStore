import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { OrderService } from '../../../proxy/orders/order.service';
import { OrderDto } from '../../../proxy/orders/models';
import { OrderStatus } from '../../../proxy/orders/order-status.enum';
import { PaymentMethod } from '../../../proxy/orders/payment-method.enum';
import { LocalizationPipe } from '@abp/ng.core';

@Component({
    selector: 'app-admin-order',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LocalizationPipe],
    templateUrl: './admin-order.component.html',
    styleUrl: './admin-order.component.scss',
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(25px)' }),
                animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class AdminOrderComponent implements OnInit {
    private orderService = inject(OrderService);
    private route = inject(ActivatedRoute);

    public isFromNotification = signal<boolean>(false);

    public allOrders = signal<OrderDto[]>([]);
    public isLoading = signal<boolean>(false);
    public selectedOrder = signal<OrderDto | null>(null);

    // 🔍 Search & Filter Signals (Lọc siêu mượt client-side bằng computed signal)
    public searchKeyword = signal<string>('');
    public filterStatus = signal<number | null>(null);
    public filterPaymentMethod = signal<number | null>(null);

    // 🌟 COMPUTED SIGNAL: Lọc mượt mà tức thì 0ms trễ, không giật trang, không quay loading
    public filteredOrders = computed(() => {
        let result = [...this.allOrders()];
        const kw = this.searchKeyword().trim().toLowerCase();

        // 1. Lọc theo từ khóa (Mã đơn, Tên khách hàng, Số điện thoại)
        if (kw) {
            result = result.filter(o =>
                (o.orderNo && o.orderNo.toLowerCase().includes(kw)) ||
                (o.receiverName && o.receiverName.toLowerCase().includes(kw)) ||
                (o.receiverPhone && o.receiverPhone.toLowerCase().includes(kw))
            );
        }

        // 2. Lọc theo Trạng thái
        const status = this.filterStatus();
        if (status !== null) {
            result = result.filter(o => o.status === status);
        }

        // 3. Lọc theo Phương thức thanh toán
        const pm = this.filterPaymentMethod();
        if (pm !== null) {
            result = result.filter(o => o.paymentMethod === pm);
        }

        return result;
    });

    public totalCount = computed(() => this.filteredOrders().length);

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['search']) {
                this.searchKeyword.set(params['search']);
                this.isFromNotification.set(true);
            }
        });
        this.loadAllOrders();
    }

    loadAllOrders(): void {
        this.isLoading.set(true);
        this.orderService.getList({
            skipCount: 0,
            maxResultCount: 1000
        }).subscribe({
            next: (result) => {
                this.allOrders.set(result.items || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    // 🔍 Tìm kiếm (Real-time mượt mà tức thì khi gõ)
    onSearchInput(event: Event): void {
        const val = (event.target as HTMLInputElement).value;
        this.searchKeyword.set(val);
    }

    onSearchSubmit(): void {
        // Đã tự động lọc tức thì qua computed
    }

    onSearchKeydown(event: KeyboardEvent): void {
        // Đã tự động lọc tức thì qua computed
    }

    // 📋 Lọc trạng thái
    onFilterStatusChange(event: Event): void {
        const val = (event.target as HTMLSelectElement).value;
        this.filterStatus.set(val === '' ? null : Number(val));
    }

    // 💳 Lọc phương thức thanh toán
    onFilterPaymentChange(event: Event): void {
        const val = (event.target as HTMLSelectElement).value;
        this.filterPaymentMethod.set(val === '' ? null : Number(val));
    }

    // 🔄 Xóa bộ lọc
    clearFilters(): void {
        this.searchKeyword.set('');
        this.filterStatus.set(null);
        this.filterPaymentMethod.set(null);
    }

    viewDetail(order: OrderDto): void {
        this.selectedOrder.set(order);
    }

    changeStatus(orderId: string | undefined, event: Event): void {
        if (!orderId) return;
        const selectElement = event.target as HTMLSelectElement;
        const newStatus = Number(selectElement.value) as OrderStatus;

        this.orderService.putStatus(orderId, { status: newStatus }).subscribe({
            next: () => {
                alert('✅ Đã cập nhật trạng thái đơn hàng!');
                this.loadAllOrders();
            },
            error: (err) => {
                console.error(err);
                alert('❌ Cập nhật trạng thái thất bại!');
            },
        });
    }

    getStatusBadgeClass(status?: OrderStatus): string {
        if (status === undefined || status === null) return 'bg-secondary';
        const classes: Record<number, string> = {
            0: 'bg-warning text-dark',
            1: 'bg-info text-dark',
            2: 'bg-primary text-white',
            3: 'bg-success text-white',
            4: 'bg-danger text-white',
        };
        return classes[status] || 'bg-secondary';
    }
}
