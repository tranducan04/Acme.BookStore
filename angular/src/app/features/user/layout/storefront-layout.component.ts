import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from '../../../shared/components/storefront/announcement-bar/announcement-bar.component';
import { UserHeaderComponent } from '../../../shared/components/storefront/user-header/user-header.component';
import { UserFooterComponent } from '../../../shared/components/storefront/user-footer/user-footer.component';
import { ToastNotificationComponent } from '../../../shared/components/storefront/toast-notification/toast-notification.component';
import { FloatingChatsComponent } from '../chat-support/floating-chats.component';
import { ThemeService } from '../../../shared/services/theme.service';
import { CartSignalStore } from '../Carts/cart-signal.store';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AnnouncementBarComponent,
    UserHeaderComponent,
    UserFooterComponent,
    ToastNotificationComponent,
    FloatingChatsComponent
  ],
  template: `
    <div class="storefront-layout min-vh-100 d-flex flex-column" [attr.data-theme]="themeService.currentTheme()">
      <!-- Toast Container -->
      <app-toast-notification />

      <!-- Announcement Banner -->
      <app-announcement-bar />

      <!-- Global Sticky Header -->
      <app-user-header [cartCount]="cartStore.cart()?.totalCount || 0" />

      <!-- Dynamic Content Page -->
      <main class="storefront-main flex-grow-1">
        <router-outlet />
      </main>

      <!-- Global Digital Bookstore Footer -->
      <app-user-footer />

      <!-- Floating Support & AI Chat Widgets -->
      <app-floating-chats />
    </div>
  `,
  styles: [`
    .storefront-layout {
      font-family: var(--bs-font-sans, 'Plus Jakarta Sans', sans-serif);
      background-color: var(--bs-bg-soft, #f8fafc);
      color: var(--bs-text-body, #475569);
      transition: background-color 0.25s ease, color 0.25s ease;
    }
    .storefront-main {
      min-height: calc(100vh - 350px);
    }
  `]
})
export class StorefrontLayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly cartStore = inject(CartSignalStore);
}
