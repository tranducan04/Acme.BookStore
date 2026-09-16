import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { OrderService } from '../../../proxy/orders/order.service';
import { OrderDto } from '../../../proxy/orders/models';
import { OrderStatus } from '../../../proxy/orders/order-status.enum';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { BookService } from '../../../proxy/books/book.service';

@Component({
    selector: 'app-order',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(25px)' }),
                animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class OrderComponent implements OnInit {
    private orderService = inject(OrderService);
    private reviewService = inject(BookReviewService);
    private bookService = inject(BookService);
    private route = inject(ActivatedRoute);
    private cartStore = inject(CartSignalStore);
    private router = inject(Router);

    public orders = signal<OrderDto[]>([]);
    public isLoading = signal<boolean>(false);
    public isReordering = signal<boolean>(false);
    public selectedTab = signal<number>(-1); // -1: Tất cả, 0: Đã đặt, 1: Đang xử lý, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy
    public searchOrderNo = signal<string>(''); //  Signal lưu mã đơn cần tìm từ thông báo

    // Modal Đánh giá Sách (Review Modal Signals)
    public isReviewModalOpen = signal<boolean>(false);
    public selectedBookForReview = signal<{ bookId: string; bookName: string } | null>(null);
    public reviewRating = signal<number>(5);
    public reviewComment = signal<string>('');
    public isSubmittingReview = signal<boolean>(false);
    // Lọc danh sách đơn hàng theo Tab được chọn
    // 🌟 TỰ ĐỘNG LỌC ĐÚNG ĐƠN HÀNG KHI ĐẾN TỪ THÔNG BÁO
    public filteredOrders = computed(() => {
        const search = this.searchOrderNo().trim().toLowerCase();
        let list = this.orders();
        // 1. Nếu đến từ Thông báo có mã đơn search -> Hiện đúng duy nhất đơn đó
        if (search) {
            return list.filter(o => o.orderNo?.toLowerCase().includes(search));
        }
        // 2. Ngược lại lọc theo Tab như bình thường
        const tab = this.selectedTab();
        if (tab === -1) return list;
        return list.filter(o => o.status === tab);
    });
    ngOnInit(): void {
        // Lắng nghe mã đơn truyền trên URL (?search=ORD-...)
        this.route.queryParams.subscribe(params => {
            if (params['search']) {
                this.searchOrderNo.set(params['search']);
                this.selectedTab.set(-1); // Đặt về tab Tất cả để tìm kiếm
            }
        });
        this.loadOrders();
    }
    async loadOrders() {
        this.isLoading.set(true);
        try {
            const result = await firstValueFrom(this.orderService.getMyOrders({ skipCount: 0, maxResultCount: 50 }));
            this.orders.set(result.items || []);
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
        } finally {
            this.isLoading.set(false);
        }
    }
    // 🌟 HÀM HỦY ĐƠN HÀNG DÀNH CHO KHÁCH HÀNG
    async cancelOrder(order: OrderDto) {
        if (!order.id) return;
        const confirmCancel = confirm(`❓ Bạn có chắc chắn muốn hủy đơn hàng "${order.orderNo}" không?\n(Số lượng sách sẽ được tự động hoàn lại vào kho)`);
        if (!confirmCancel) return;

        try {
            await firstValueFrom(this.orderService.cancelMyOrder(order.id));
            alert('✅ Đã hủy đơn hàng thành công!');
            await this.loadOrders();
        } catch (err: any) {
            alert('❌ Hủy đơn hàng thất bại: ' + (err?.error?.error?.message || err?.message || 'Có lỗi xảy ra'));
        }
    }

    // Đếm số lượng đơn theo từng trạng thái
    getCountByStatus(status: number): number {
        return this.orders().filter(o => o.status === status).length;
    }

    getStatusLabel(status?: OrderStatus): string {
        if (status === undefined || status === null) return 'Chưa rõ';
        const labels: Record<number, string> = {
            0: 'Chờ xác nhận',
            1: 'Đang đóng gói',
            2: 'Đang vận chuyển',
            3: 'Giao thành công',
            4: 'Đã hủy đơn',
        };
        return labels[status] || 'Chưa rõ';
    }

    getStatusBadgeClass(status?: OrderStatus): string {
        if (status === undefined || status === null) return 'badge-secondary';
        const classes: Record<number, string> = {
            0: 'badge-info',
            1: 'badge-warning',
            2: 'badge-primary',
            3: 'badge-success',
            4: 'badge-danger',
        };
        return classes[status] || 'badge-secondary';
    }
    // 🌟 HÀM MUA LẠI: KIỂM TRA SẢN PHẨM CÒN TỒN TẠI KHÔNG TRƯỚC KHI THÊM VÀO GIỎ HÀNG
    async reorder(order: OrderDto) {
        if (this.isReordering()) return;

        // Nếu danh sách sản phẩm trong đơn rỗng hoặc bằng 0 (do sản phẩm đã bị xóa khỏi hệ thống)
        if (!order.items || order.items.length === 0) {
            alert('❌ Sản phẩm trong đơn hàng này không còn tồn tại hoặc đã bị Admin xóa khỏi hệ thống!\nKhông thể đặt lại đơn hàng này.');
            return;
        }

        this.isReordering.set(true);

        const unavailableBooks: string[] = [];
        let addedCount = 0;

        try {
            for (const item of order.items) {
                if (item.bookId) {
                    try {
                        // Kiểm tra xem sản phẩm có còn tồn tại (chưa bị xóa) trong hệ thống không
                        const book = await firstValueFrom(this.bookService.get(item.bookId));
                        if (book && book.id) {
                            await this.cartStore.addToCart(item.bookId, item.count || 1);
                            addedCount++;
                        } else {
                            unavailableBooks.push(item.bookName && item.bookName.trim() !== '' ? item.bookName : 'Sách đã ngưng kinh doanh/xóa');
                        }
                    } catch (err) {
                        // Nếu API trả về 404 Not Found hoặc lỗi (sách đã bị Admin xóa soft-delete)
                        unavailableBooks.push(item.bookName && item.bookName.trim() !== '' ? item.bookName : 'Sách đã ngưng kinh doanh/xóa');
                    }
                }
            }

            // Thông báo cho người dùng kết quả
            if (unavailableBooks.length > 0) {
                const names = unavailableBooks.map(name => `• ${name}`).join('\n');
                if (addedCount > 0) {
                    alert(`⚠️ Một số sản phẩm trong đơn hàng không còn tồn tại hoặc đã bị Admin xóa khỏi hệ thống:\n${names}\n\nCác sản phẩm còn lại đã được thêm vào giỏ hàng!`);
                    this.router.navigate(['/cart']);
                } else {
                    alert(`❌ Tất cả sản phẩm trong đơn hàng này không còn tồn tại hoặc đã bị Admin xóa khỏi hệ thống:\n${names}\n\nKhông thể đặt lại đơn hàng này!`);
                }
            } else {
                // Tất cả sản phẩm đều hợp lệ
                this.router.navigate(['/cart']);
            }
        } finally {
            this.isReordering.set(false);
        }
    }

    // 🌟 CHỨC NĂNG ĐÁNH GIÁ SÁCH DÀNH CHO ĐƠN HOÀN THÀNH
    openReviewModal(bookId?: string, bookName?: string) {
        if (!bookId) return;
        this.selectedBookForReview.set({ bookId, bookName: bookName || 'Sách' });
        this.reviewRating.set(5);
        this.reviewComment.set('');
        this.isReviewModalOpen.set(true);
    }

    closeReviewModal() {
        this.isReviewModalOpen.set(false);
        this.selectedBookForReview.set(null);
    }

    setReviewRating(stars: number) {
        this.reviewRating.set(stars);
    }

    async submitReview() {
        const book = this.selectedBookForReview();
        if (!book) return;

        const comment = this.reviewComment().trim();
        if (!comment) {
            alert('⚠️ Vui lòng nhập nội dung đánh giá của bạn!');
            return;
        }

        this.isSubmittingReview.set(true);
        try {
            await firstValueFrom(this.reviewService.create({
                bookId: book.bookId,
                rating: this.reviewRating(),
                comment: comment
            }));
            alert('🎉 Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!');
            this.closeReviewModal();
        } catch (err: any) {
            console.error('Lỗi gửi đánh giá:', err);
            const errMsg = err?.error?.error?.message || err?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
            alert('❌ ' + errMsg);
        } finally {
            this.isSubmittingReview.set(false);
        }
    }
}
