import { Routes } from '@angular/router';
import { authGuard, eLayoutType } from '@abp/ng.core';
import { StorefrontLayoutComponent } from './features/user/layout/storefront-layout.component';

export const appRoutes: Routes = [
  // 1. GIAO DIỆN KHÁCH HÀNG (STOREFRONT) - SỬ DỤNG STOREFRONT LAYOUT VÀ EMPTY ABP LAYOUT ĐỂ CÔ LẬP
  {
    path: '',
    component: StorefrontLayoutComponent,
    data: { layout: eLayoutType.empty },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/user/home/home.component').then(m => m.HomeComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'books',
        loadComponent: () => import('./features/user/catalog/book-catalog.component').then(m => m.BookCatalogComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'books/:id',
        loadComponent: () => import('./features/user/book-detail/book-detail.component').then(m => m.BookDetailComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/user/Carts/cart.component').then(m => m.CartComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/user/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard],
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/user/Orders/order.component').then(m => m.OrderComponent),
        canActivate: [authGuard],
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./features/user/Orders/order.component').then(m => m.OrderComponent),
        canActivate: [authGuard],
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/user/Wishlists/wishlist.component').then(m => m.WishlistComponent),
        canActivate: [authGuard],
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/user/Notifications/notification.component').then(m => m.NotificationComponent),
        canActivate: [authGuard],
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'about',
        loadComponent: () => import('./features/user/about/about.component').then(m => m.AboutComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/user/contact/contact.component').then(m => m.ContactComponent),
        data: { layout: eLayoutType.empty },
      },
      {
        path: 'chat-support',
        loadComponent: () => import('./features/user/chat-support/customer-chat.component').then(m => m.CustomerChatComponent),
        data: { layout: eLayoutType.empty },
      },
    ]
  },

  // 2. GIAO DIỆN QUẢN TRỊ ADMIN (LEPTONX DYNAMIC LAYOUT NGUYÊN BẢN)
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.createRoutes()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.createRoutes()),
  },
  {
    path: 'tenant-management',
    loadChildren: () => import('@abp/ng.tenant-management').then(m => m.createRoutes()),
  },
  {
    path: 'setting-management',
    loadChildren: () => import('@abp/ng.setting-management').then(m => m.createRoutes()),
  },
  {
    path: 'admin/books',
    loadComponent: () => import('./features/admin/Books/book.component').then((m) => m.BookComponent),
  },
  {
    path: 'authors',
    loadComponent: () => import('./features/admin/Authors/author.component').then((m) => m.AuthorComponent),
  },
  {
    path: 'admin-orders',
    loadComponent: () => import('./features/admin/AdminOrders/admin-order.component').then((m) => m.AdminOrderComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/admin/Dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'publishers',
    loadComponent: () => import('./features/admin/Publishers/publisher.component').then(m => m.PublisherComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/admin/Categories/category.component').then(m => m.CategoryComponent),
  },
  {
    path: 'admin/reviews',
    loadComponent: () => import('./features/admin/AdminReviews/admin-reviews.component').then(m => m.AdminReviewsComponent),
  },
  {
    path: 'admin/chat',
    loadComponent: () => import('./features/admin/AdminChat/admin-chat.component').then(m => m.AdminChatComponent),
  },
  {
    path: 'coupons',
    loadComponent: () => import('./features/admin/Coupons/coupon.component').then(m => m.CouponComponent),
  },
  {
    path: 'admin/coupons',
    loadComponent: () => import('./features/admin/Coupons/coupon.component').then(m => m.CouponComponent),
  },
  {
    path: 'logout',
    loadComponent: () => import('./logout.component').then((m) => m.LogoutComponent),
  },
];
