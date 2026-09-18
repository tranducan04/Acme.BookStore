import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { PermissionService, LocalizationPipe } from '@abp/ng.core';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { WishlistItemDto, FavoriteBookStatDto } from '../../../proxy/wishlists/models';
import { CartSignalStore } from '../Carts/cart-signal.store';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterModule, LocalizationPipe],
    templateUrl: './wishlist.component.html',
    styleUrls: ['./wishlist.component.scss'],
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(25px)' }),
                animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class WishlistComponent implements OnInit {
    private wishlistService = inject(WishlistService);
    public permission = inject(PermissionService);
    public cartStore = inject(CartSignalStore);

    public wishlistItems = signal<WishlistItemDto[]>([]);
    public adminFavoriteBooks = signal<FavoriteBookStatDto[]>([]);
    public isLoading = signal<boolean>(false);

    get isAdminOrAuthor(): boolean {
        return this.permission.getGrantedPolicy('BookStore.Books.Create') ||
            this.permission.getGrantedPolicy('BookStore.Books.Edit');
    }
    ngOnInit() {
        this.loadData();
    }
    async loadData() {
        this.isLoading.set(true);
        try {
            if (this.isAdminOrAuthor) {
                // Nếu là Admin / Tác giả -> Tải bảng xếp hạng sách được yêu thích nhất
                const topBooks = await firstValueFrom(this.wishlistService.getTopFavoriteBooks());
                this.adminFavoriteBooks.set(topBooks || []);
            } else {
                // Nếu là User -> Tải danh sách yêu thích cá nhân
                const items = await firstValueFrom(this.wishlistService.getMyWishlist());
                this.wishlistItems.set(items || []);
            }
        } catch (err) {
            console.error('Lỗi tải dữ liệu yêu thích:', err);
        } finally {
            this.isLoading.set(false);
        }
    }
    async removeItem(bookId?: string) {
        if (!bookId) return;
        try {
            await firstValueFrom(this.wishlistService.toggleWishlist(bookId));
            this.wishlistItems.update(items => items.filter(x => x.bookId !== bookId));
        } catch (err) {
            console.error('Lỗi xóa khỏi yêu thích:', err);
        }
    }
    addToCart(bookId?: string) {
        if (!bookId) return;
        this.cartStore.addToCart(bookId);
    }
}
