import { Routes } from '@angular/router';



export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/user/home/home.routes').then(m => m.homeRoutes),
  },
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
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.createRoutes()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.createRoutes()),
  },
  {
    path: 'books',
    loadComponent: () => import('./features/admin/Books/book.component').then((m) => m.BookComponent),
  },
  {
    path: 'authors',
    loadComponent: () => import('./features/admin/Authors/author.component').then((m) => m.AuthorComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/user/Carts/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/user/Orders/order.component').then((m) => m.OrderComponent),
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
    path: 'about',
    loadComponent: () => import('./features/user/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/user/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'logout',
    loadComponent: () => import('./logout.component').then((m) => m.LogoutComponent),
  },
  {
    path: 'publishers',
    loadComponent: () => import('./features/admin/Publishers/publisher.component').then(m => m.PublisherComponent)
  },
  {
    path: 'admin/reviews',
    loadComponent: () => import('./features/admin/AdminReviews/admin-reviews.component').then(m => m.AdminReviewsComponent),
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/user/Wishlists/wishlist.component').then(m => m.WishlistComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/user/Notifications/notification.component').then(m => m.NotificationComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/admin/Categories/category.component').then(m => m.CategoryComponent),
  },
  {
    path: 'chat-support',
    loadComponent: () => import('./features/user/chat-support/customer-chat.component').then(m => m.CustomerChatComponent),
  },
  {
    path: 'admin/chat',
    loadComponent: () => import('./features/admin/AdminChat/admin-chat.component').then(m => m.AdminChatComponent),
  },

];
