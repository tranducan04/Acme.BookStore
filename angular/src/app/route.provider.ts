import { RoutesService, eLayoutType, PermissionService } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService, PermissionService], multi: true },
];

function configureRoutes(routesService: RoutesService, permissionService: PermissionService) {
  return () => {
    routesService.add([
      {
        path: '/',
        name: '::Menu:Home',
        iconClass: 'fas fa-home',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/books',
        name: '::Menu:Books',
        iconClass: 'fas fa-book',
        order: 2,
        layout: eLayoutType.application,
      },
      {
        path: '/cart',
        name: '::Menu:Cart',
        iconClass: 'fas fa-shopping-cart',
        order: 3,
        layout: eLayoutType.application,
      },
      {
        path: '/wishlist',
        name: '::Menu:Wishlist',
        iconClass: 'fas fa-heart',
        order: 4,
        layout: eLayoutType.application,
      },
      {
        path: '/orders',
        name: '::Menu:Orders',
        iconClass: 'fas fa-clipboard-list',
        order: 5,
        layout: eLayoutType.application,
      },
      {
        path: '/notifications',
        name: '::Menu:Notifications',
        iconClass: 'fas fa-bell',
        order: 6,
        layout: eLayoutType.application,
      },
      {
        path: '/about',
        name: '::Menu:About',
        iconClass: 'fas fa-info-circle',
        order: 7,
        layout: eLayoutType.application,
      },
      {
        path: '/contact',
        name: '::Menu:Contact',
        iconClass: 'fas fa-envelope',
        order: 8,
        layout: eLayoutType.application,
      },
      {
        path: '/chat-support',
        name: '::Menu:ChatSupport',
        iconClass: 'fas fa-comments',
        order: 9,
        layout: eLayoutType.application,
      },
      {
        path: '/admin-orders',
        name: '::Menu:AdminOrders',
        iconClass: 'fas fa-tasks',
        order: 10,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/admin/chat',
        name: '::Menu:AdminChat',
        iconClass: 'fas fa-headset',
        order: 11,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/authors',
        name: '::Menu:Authors',
        iconClass: 'fas fa-user-edit',
        order: 12,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/categories',
        name: '::Menu:Categories',
        iconClass: 'fas fa-tags',
        order: 13,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/publishers',
        name: '::Menu:Publishers',
        iconClass: 'fas fa-building',
        order: 14,
        layout: eLayoutType.application,
        requiredPolicy: 'BookStore.Books.Create',
      },
      {
        path: '/dashboard',
        name: '::Menu:Dashboard',
        iconClass: 'fas fa-chart-line',
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
    ]);

    permissionService.getGrantedPolicy$('BookStore.Books.Create').subscribe((isAdmin) => {
      const hideForAdminPaths = ['/cart', '/orders', '/about', '/contact', '/chat-support'];
      hideForAdminPaths.forEach(path => {
        const route = routesService.find(r => r.path === path);
        if (route) {
          routesService.patch(route.name, { invisible: isAdmin });
        }
      });
    });
  };
}
