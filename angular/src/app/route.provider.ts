import { RoutesService, eLayoutType } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];

function configureRoutes(routesService: RoutesService) {
  return () => {
    routesService.add([
      {
        path: '/',
        name: 'Trang chủ 🏠',
        iconClass: 'fas fa-home',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/books',
        name: 'Danh mục Sách 📚',
        iconClass: 'fas fa-book',
        order: 2,
        layout: eLayoutType.application,
      },
      {
        path: '/cart',
        name: 'Giỏ hàng 🛒',
        iconClass: 'fas fa-shopping-cart',
        order: 3,
        layout: eLayoutType.application,
      },
      {
        path: '/wishlist',
        name: 'Yêu Thích 💖',
        iconClass: 'fas fa-heart',
        order: 4,
        layout: eLayoutType.application,
      },
      {
        path: '/orders',
        name: 'Đơn hàng của tôi 📋',
        iconClass: 'fas fa-clipboard-list',
        order: 5,
        layout: eLayoutType.application,
      },
      {
        path: '/notifications',
        name: 'Thông báo 🔔',
        iconClass: 'fas fa-bell',
        order: 6,
        layout: eLayoutType.application,
      },
      {
        path: '/about',
        name: 'Giới thiệu ℹ️',
        iconClass: 'fas fa-info-circle',
        order: 7,
        layout: eLayoutType.application,
      },
      {
        path: '/contact',
        name: 'Liên hệ 📞',
        iconClass: 'fas fa-envelope',
        order: 8,
        layout: eLayoutType.application,
      },
      {
        path: '/chat-support',
        name: 'Hỗ trợ Trực tuyến 💬',
        iconClass: 'fas fa-comments',
        order: 9,
        layout: eLayoutType.application,
        requiredPolicy: '!BookStore.Books.Create',
      },
      {
        path: '/admin-orders',
        name: 'Quản lý Đơn hàng 👑',
        iconClass: 'fas fa-tasks',
        order: 10,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/chat',
        name: 'Tư vấn Khách hàng 💬',
        iconClass: 'fas fa-headset',
        order: 11,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/authors',
        name: 'Quản lý Tác giả 👤',
        iconClass: 'fas fa-user-edit',
        order: 12,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/categories',
        name: 'Quản lý Danh mục 🏷️',
        iconClass: 'fas fa-tags',
        order: 13,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/publishers',
        name: 'Nhà Xuất Bản 🏢',
        iconClass: 'fas fa-building',
        order: 14,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/dashboard',
        name: 'Báo cáo Thống kê 📊',
        iconClass: 'fas fa-chart-line',
        order: 15,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/reviews',
        name: 'Quản lý Đánh giá 📝',
        iconClass: 'fas fa-star',
        order: 16,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
    ]);
  };
}
