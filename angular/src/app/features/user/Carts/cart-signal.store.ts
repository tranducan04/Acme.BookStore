import { inject, Injectable, signal } from '@angular/core';
import { CartService, CartDto } from '@proxy/carts';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@abp/ng.core';
import { ToastService } from '../../../shared/services/toast.service';

/// <summary>
/// Signal Store chịu trách nhiệm Quản lý Trạng thái Giỏ hàng (Cart State) ở Frontend.
/// Giúp lưu trữ giỏ hàng trong bộ nhớ và cập nhật giao diện mượt mà không cần load lại trang.
/// </summary>
@Injectable({ providedIn: 'root' })
export class CartSignalStore {
    private readonly cartService = inject(CartService);
    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);

    // 1. Dữ liệu Giỏ hàng lưu dưới dạng Angular Signal
    readonly cart = signal<CartDto | null>(null);
    readonly isLoading = signal<boolean>(false);

    /// <summary>
    /// Hàm Tải dữ liệu Giỏ hàng từ Backend API về Frontend
    /// </summary>
    async loadCart(silent: boolean = false) {
        if (!silent && !this.cart()) {
            this.isLoading.set(true);
        }
        try {
            const res = await firstValueFrom(this.cartService.get());
            this.cart.set(res);
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading.set(false);
        }
    }

    /// <summary>
    /// Hàm Thêm Sách vào Giỏ hàng khi bấm nút "Add to Cart"
    /// </summary>
    async addToCart(bookId: string, count: number = 1) {
        if (!this.authService.isAuthenticated) {
            this.toastService.showWarning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            this.authService.navigateToLogin();
            return;
        }
        try {
            await firstValueFrom(this.cartService.postToCart({ bookId, count }));
            await this.loadCart(true);
            this.toastService.showSuccess('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (err) {
            console.error('Lỗi thêm giỏ hàng:', err);
            this.toastService.showError('Không thể thêm sản phẩm vào giỏ hàng.');
        }
    }

    /// <summary>
    /// Hàm Cập nhật số lượng Sách trong Giỏ hàng (Tăng/Giảm nút +/-)
    /// Đã tích hợp kỹ thuật Optimistic UI Update giúp phản hồi tức thì 0.001s!
    /// </summary>
    async updateCount(bookId: string, count: number) {
        // BƯỚC 1: Cập nhật trạng thái tức thì trên Giao diện (Optimistic UI Update)
        const currentCart = this.cart();
        if (currentCart && currentCart.items) {
            const items = currentCart.items
                .map(item => {
                    if (item.bookId === bookId) {
                        return {
                            ...item,
                            count,
                            totalPrice: (item.price || 0) * count
                        };
                    }
                    return item;
                })
                .filter(item => (item.count || 0) > 0);

            const totalCount = items.reduce((sum, i) => sum + (i.count || 0), 0);
            const totalPrice = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);

            this.cart.set({
                ...currentCart,
                items,
                totalCount,
                totalPrice
            });
        }

        // BƯỚC 2: Gửi API ngầm để lưu vào SQL Server Backend
        try {
            await firstValueFrom(this.cartService.putCartItem(bookId, count));
            await this.loadCart(true);
        } catch (err) {
            console.error('Lỗi cập nhật số lượng:', err);
            await this.loadCart(true); // Revert on failure
        }
    }

    /// <summary>
    /// Hàm Xóa hẳn 1 cuốn Sách ra khỏi Giỏ hàng (Gán số lượng = 0)
    /// </summary>
    async removeItem(bookId: string) {
        await this.updateCount(bookId, 0);
        this.toastService.showInfo('Đã xóa cuốn sách khỏi giỏ hàng.');
    }
}
