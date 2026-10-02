import { Component, inject, OnInit, effect } from '@angular/core';
import { InternetConnectionStatusComponent, LoaderBarComponent, NavItemsService } from '@abp/ng.theme.shared';
import { ConfigStateService, DynamicLayoutComponent, PermissionService, RoutesService, LocalizationService } from '@abp/ng.core';
import { CartSignalStore } from './features/user/Carts/cart-signal.store';
import { NotificationBellComponent } from './features/user/Notifications/notification-bell.component';
import { ChatBotComponent } from './features/user/chat-bot/chat-bot.component';


@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar />
    <abp-dynamic-layout />
    <abp-internet-status />
  `,
  imports: [LoaderBarComponent, DynamicLayoutComponent, InternetConnectionStatusComponent],
})
export class AppComponent implements OnInit {
  private routesService = inject(RoutesService);
  private permissionService = inject(PermissionService);
  private configState = inject(ConfigStateService);
  private localization = inject(LocalizationService);
  private cartStore = inject(CartSignalStore);
  private navItems = inject(NavItemsService);

  constructor() {
    // 🌟 ĐĂNG KÝ CHUÔNG THÔNG BÁO VÀO THANH HEADER CẠNH USER AVATAR
    this.navItems.addItems([
      {
        id: 'NotificationBell',
        order: 1, // Xuất hiện trước Avatar User
        component: NotificationBellComponent,
      },
    ]);

    // Lắng nghe Signal Giỏ hàng bằng effect()
    effect(() => {
      this.cartStore.cart();
      this.updateCartRoute();
    });
  }

  private updateCartRoute(): void {
    const cart = this.cartStore.cart();
    const count = cart?.totalCount || 0;
    const isAdmin = this.permissionService.getGrantedPolicy('BookStore.Books.Edit');

    if (!isAdmin) {
      const cartRoute = this.routesService.find(r => r.path === '/cart');
      if (cartRoute) {
        const localizedCartName = this.localization.instant('::Menu:Cart') || 'Cart 🛒';
        const cartLabel = count > 0 ? `${localizedCartName.replace('🛒', '').trim()} 🔴${count} 🛒` : localizedCartName;
        this.routesService.patch(cartRoute.name, { name: cartLabel });
      }
    }
  }

  ngOnInit(): void {
    this.cartStore.loadCart(true);

    this.configState.getAll$().subscribe(() => {
      // Đảm bảo toàn bộ các route storefront luôn ẩn khỏi sidebar LeptonX
      const storefrontPaths = ['/', '/books', '/cart', '/wishlist', '/orders', '/notifications', '/about', '/contact', '/chat-support'];
      storefrontPaths.forEach(path => {
        const route = this.routesService.find(r => r.path === path);
        if (route) {
          this.routesService.patch(route.name, { invisible: true });
        }
      });
      this.updateCartRoute();
    });
  }
}
