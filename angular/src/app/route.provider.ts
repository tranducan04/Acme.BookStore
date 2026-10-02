import { RoutesService, eLayoutType, PermissionService } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService, PermissionService], multi: true },
];

function configureRoutes(routesService: RoutesService, permissionService: PermissionService) {
  return () => {
    routesService.add([
      // Storefront Routes: Ẩn hoàn toàn khỏi LeptonX sidebar vì Storefront đã có UserHeader riêng
      {
        path: '/',
        name: '::Menu:Home',
        iconClass: 'fas fa-home',
        order: 1,
        invisible: true,
      },
      {
        path: '/books',
        name: '::Menu:Books',
        iconClass: 'fas fa-book',
        order: 2,
        invisible: true,
      },
      {
        path: '/cart',
        name: '::Menu:Cart',
        iconClass: 'fas fa-shopping-cart',
        order: 3,
        invisible: true,
      },
      {
        path: '/wishlist',
        name: '::Menu:Wishlist',
        iconClass: 'fas fa-heart',
        order: 4,
        invisible: true,
      },
      {
        path: '/orders',
        name: '::Menu:Orders',
        iconClass: 'fas fa-clipboard-list',
        order: 5,
        invisible: true,
      },
      {
        path: '/notifications',
        name: '::Menu:Notifications',
        iconClass: 'fas fa-bell',
        order: 6,
        invisible: true,
      },
      {
        path: '/chat-support',
        name: '::Menu:ChatSupport',
        iconClass: 'fas fa-comments',
        order: 7,
        invisible: true,
      },
      {
        path: '/about',
        name: '::Menu:About',
        iconClass: 'fas fa-info-circle',
        order: 8,
        invisible: true,
      },
      {
        path: '/contact',
        name: '::Menu:Contact',
        iconClass: 'fas fa-envelope',
        order: 9,
        invisible: true,
      },

      // Admin Routes: Hiển thị trên LeptonX sidebar dành riêng cho quản trị viên (Admin)
      {
        path: '/dashboard',
        name: '::Menu:Dashboard',
        iconClass: 'fas fa-chart-line',
        order: 10,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin-orders',
        name: '::Menu:AdminOrders',
        iconClass: 'fas fa-tasks',
        order: 11,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/books',
        name: '::Menu:BooksAdmin',
        iconClass: 'fas fa-book',
        order: 12,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/authors',
        name: '::Menu:Authors',
        iconClass: 'fas fa-user-edit',
        order: 13,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/categories',
        name: '::Menu:Categories',
        iconClass: 'fas fa-tags',
        order: 14,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/publishers',
        name: '::Menu:Publishers',
        iconClass: 'fas fa-building',
        order: 15,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/reviews',
        name: '::Menu:Reviews',
        iconClass: 'fas fa-star',
        order: 16,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/coupons',
        name: '::Menu:Coupons',
        iconClass: 'fas fa-ticket-alt',
        order: 17,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/chat',
        name: '::Menu:AdminChat',
        iconClass: 'fas fa-headset',
        order: 18,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
    ]);
  };
}
