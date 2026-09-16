import { Component, inject, OnInit, effect } from '@angular/core';
import { InternetConnectionStatusComponent, LoaderBarComponent, NavItemsService } from '@abp/ng.theme.shared';
import { ConfigStateService, DynamicLayoutComponent, PermissionService, RoutesService } from '@abp/ng.core';
import { CartSignalStore } from './features/user/Carts/cart-signal.store';
import { NotificationBellComponent } from './features/user/Notifications/notification-bell.component';
import { ChatBotComponent } from './features/user/chat-bot/chat-bot.component';


@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar />
    <abp-dynamic-layout />
    <abp-internet-status />
    <app-chat-bot />
  `,
  imports: [LoaderBarComponent, DynamicLayoutComponent, InternetConnectionStatusComponent, ChatBotComponent],
})
export class AppComponent implements OnInit {
  private routesService = inject(RoutesService);
  private permissionService = inject(PermissionService);
  private configState = inject(ConfigStateService);
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
      const cart = this.cartStore.cart();
      const count = cart?.totalCount || 0;
      const isAdmin = this.permissionService.getGrantedPolicy('BookStore.Books.Edit');

      if (!isAdmin) {
        const cartRoute = this.routesService.find(r => r.path === '/cart');
        if (cartRoute) {
          const cartLabel = count > 0 ? `Giỏ hàng 🔴${count} 🛒` : 'Giỏ hàng 🛒';
          this.routesService.patch(cartRoute.name, { name: cartLabel });
        }
      }
    });
  }

  ngOnInit(): void {
    this.cartStore.loadCart(true);

    this.configState.getAll$().subscribe(() => {
      const isAdmin = this.permissionService.getGrantedPolicy('BookStore.Books.Edit');
      const cartRoute = this.routesService.find(r => r.path === '/cart');
      if (cartRoute) {
        this.routesService.patch(cartRoute.name, { invisible: isAdmin });
      }
      this.routesService.patch('Đơn hàng của tôi 📋', { invisible: isAdmin });
      this.routesService.patch('Tác giả 👤', { invisible: isAdmin });
      this.routesService.patch('Giới thiệu ℹ️', { invisible: isAdmin });
      this.routesService.patch('Liên hệ 📞', { invisible: isAdmin });
    });
  }
}
