import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ConfigStateService, PermissionService } from '@abp/ng.core';
import { ThemeService } from '../../../services/theme.service';
import { CartSignalStore } from '../../../../features/user/Carts/cart-signal.store';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="storefront-header sticky-top bg-white border-bottom shadow-sm">
      <div class="container-fluid px-3 px-xl-5 py-2">
        <div class="d-flex align-items-center justify-content-between gap-3">
          
          <!-- 1. LOGO THƯƠNG HIỆU -->
          <a routerLink="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-2 flex-shrink-0">
            <div class="brand-logo-icon rounded-3 d-flex align-items-center justify-content-center bg-primary text-white shadow-sm">
              <i class="fas fa-book-reader fs-5"></i>
            </div>
            <div class="brand-text text-nowrap">
              <div class="fw-bold fs-5 text-dark brand-title">Acme <span class="text-primary">BookStore</span></div>
              <div class="brand-subtitle text-muted fs-8">Thư Viện Tri Thức Số</div>
            </div>
          </a>

          <!-- 2. THANH TÌM KIẾM TRUNG TÂM VỚI HIỆU ỨNG MỞ RỘNG (EXPANDABLE SEARCH) -->
          <div class="header-search-wrapper flex-grow-1 mx-2 d-none d-md-block"
               [class.search-expanded]="isSearchFocused()">
            <form (ngSubmit)="onSearchSubmit()" class="position-relative d-flex align-items-center w-100">
              <!-- Kính lúp đặt cố định ở BÊN TRÁI -->
              <span class="search-icon text-muted">
                <i class="fas fa-search fs-7" [class.text-primary]="isSearchFocused()"></i>
              </span>

              <!-- Ô nhập với padding-left 44px và rút gọn 3 chấm khi không vừa -->
              <input type="text"
                     [(ngModel)]="searchKeyword"
                     name="searchKeyword"
                     (focus)="onSearchFocus()"
                     (blur)="onSearchBlur()"
                     class="form-control rounded-pill py-2 fs-7 search-input w-100"
                     [placeholder]="isSearchFocused() ? 'Tìm kiếm tựa sách, tác giả, thể loại...' : 'Tìm kiếm tựa sách, tác giả...'">

              <!-- Nút xóa nhanh khi đã nhập từ khóa -->
              @if (searchKeyword) {
                <button type="button"
                        (click)="searchKeyword = ''; onSearchFocus()"
                        class="btn position-absolute end-0 me-2 p-0 text-muted border-0 bg-transparent rounded-circle d-flex align-items-center justify-content-center"
                        style="width: 28px; height: 28px;"
                        title="Xóa tìm kiếm">
                  <i class="fas fa-times-circle fs-7"></i>
                </button>
              }
            </form>
          </div>

          <!-- 3. MENU ĐIỀU HƯỚNG CHÍNH (TỰ ĐỘNG ẨN KHI FOCUS VÀO TÌM KIẾM) -->
          <nav class="d-none d-lg-flex align-items-center gap-1 main-nav flex-shrink-0"
               [class.nav-collapsed]="isSearchFocused()">
            <a routerLink="/"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: true }"
               class="nav-link-item px-3 py-2 rounded-pill fw-medium fs-7 text-decoration-none text-nowrap">
              <i class="fas fa-home me-1"></i> Trang chủ
            </a>
            <a routerLink="/books"
               routerLinkActive="active"
               class="nav-link-item px-3 py-2 rounded-pill fw-medium fs-7 text-decoration-none text-nowrap">
              <i class="fas fa-book-open me-1"></i> Tủ sách
            </a>
            <a routerLink="/about"
               routerLinkActive="active"
               class="nav-link-item px-3 py-2 rounded-pill fw-medium fs-7 text-decoration-none text-nowrap">
              <i class="fas fa-info-circle me-1"></i> Giới thiệu
            </a>
            <a routerLink="/contact"
               routerLinkActive="active"
               class="nav-link-item px-3 py-2 rounded-pill fw-medium fs-7 text-decoration-none text-nowrap">
              <i class="fas fa-headset me-1"></i> Liên hệ
            </a>
          </nav>

          <!-- 4. KHU VỰC HÀNH ĐỘNG NGƯỜI DÙNG -->
          <div class="d-flex align-items-center gap-2 user-actions flex-shrink-0">
            
            <!-- Dark / Light Theme Toggle -->
            <button type="button"
                    class="btn btn-action-icon rounded-circle d-flex align-items-center justify-content-center"
                    (click)="onThemeToggle()"
                    [title]="themeService.currentTheme() === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'"
                    aria-label="Đổi giao diện Sáng / Tối">
              @if (themeService.currentTheme() === 'dark') {
                <i class="fas fa-sun text-warning fs-6"></i>
              } @else {
                <i class="fas fa-moon text-secondary fs-6"></i>
              }
            </button>

            <!-- Wishlist Button -->
            <a routerLink="/wishlist"
               class="btn btn-action-icon rounded-circle position-relative d-flex align-items-center justify-content-center text-decoration-none"
               title="Danh sách yêu thích">
              <i class="fas fa-heart text-danger fs-6"></i>
              @if (wishlistCount() > 0) {
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-9">
                  {{ wishlistCount() > 99 ? '99+' : wishlistCount() }}
                </span>
              }
            </a>

            <!-- Cart Button -->
            <a routerLink="/cart"
               class="btn btn-action-icon rounded-circle position-relative d-flex align-items-center justify-content-center text-decoration-none"
               title="Giỏ hàng">
              <i class="fas fa-shopping-bag text-primary fs-6"></i>
              @if (computedCartCount() > 0) {
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary fs-9">
                  {{ computedCartCount() > 99 ? '99+' : computedCartCount() }}
                </span>
              }
            </a>

            <!-- Notifications Button -->
            <a routerLink="/notifications"
               class="btn btn-action-icon rounded-circle position-relative d-flex align-items-center justify-content-center text-decoration-none"
               title="Thông báo">
              <i class="fas fa-bell text-secondary fs-6"></i>
              @if (unreadNotificationCount() > 0) {
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fs-9">
                  {{ unreadNotificationCount() }}
                </span>
              }
            </a>

            <!-- User Profile / Auth Area -->
            <div class="user-profile-menu position-relative ms-1">
              @if (isAuthenticated()) {
                <div class="dropdown">
                  <button class="btn btn-user-avatar d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border"
                          type="button"
                          (click)="toggleUserDropdown()">
                    <div class="avatar-circle rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-7"
                         style="width: 32px; height: 32px;">
                      {{ userInitial() }}
                    </div>
                    <span class="fw-semibold fs-7 text-dark d-none d-sm-inline">{{ userName() }}</span>
                    <i class="fas fa-chevron-down fs-8 text-muted"></i>
                  </button>

                  @if (isUserDropdownOpen()) {
                    <div class="dropdown-menu-custom shadow-lg rounded-4 p-2 position-absolute end-0 mt-2 bg-white border show"
                         style="min-width: 210px; z-index: 1050;">
                      <div class="px-3 py-2 border-bottom mb-1">
                        <div class="fw-bold fs-7 text-dark">{{ userName() }}</div>
                        <div class="fs-8 text-muted">{{ userEmail() }}</div>
                      </div>
                      <a routerLink="/my-orders" class="dropdown-item-custom py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-decoration-none fs-7 text-dark" (click)="closeDropdown()">
                        <i class="fas fa-box-open text-primary"></i> Đơn hàng của tôi
                      </a>
                      <a routerLink="/wishlist" class="dropdown-item-custom py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-decoration-none fs-7 text-dark" (click)="closeDropdown()">
                        <i class="fas fa-heart text-danger"></i> Sách yêu thích
                      </a>
                      <a routerLink="/notifications" class="dropdown-item-custom py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-decoration-none fs-7 text-dark" (click)="closeDropdown()">
                        <i class="fas fa-bell text-warning"></i> Trung tâm thông báo
                      </a>
                      @if (isAdmin()) {
                        <div class="border-top my-1"></div>
                        <a routerLink="/dashboard" class="dropdown-item-custom py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-decoration-none fs-7 text-primary fw-semibold" (click)="closeDropdown()">
                          <i class="fas fa-user-shield text-primary"></i> Trang Quản Trị (Admin)
                        </a>
                      }
                      <div class="border-top my-1"></div>
                      <button (click)="logout()" class="dropdown-item-custom w-100 text-start py-2 px-3 rounded-3 d-flex align-items-center gap-2 border-0 bg-transparent fs-7 text-danger">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <button (click)="login()" class="btn btn-primary rounded-pill px-3 py-1 fs-7 fw-semibold shadow-sm d-flex align-items-center gap-1">
                  <i class="fas fa-sign-in-alt"></i>
                  <span class="d-none d-sm-inline">Đăng nhập</span>
                </button>
              }
            </div>

            <!-- Mobile Menu Toggle Button -->
            <button class="btn btn-action-icon rounded-circle d-lg-none d-flex align-items-center justify-content-center"
                    type="button"
                    (click)="toggleMobileMenu()"
                    aria-label="Toggle navigation">
              <i class="fas fa-bars fs-6 text-dark"></i>
            </button>

          </div>
        </div>

        <!-- Mobile Collapsible Navigation -->
        @if (isMobileMenuOpen()) {
          <div class="mobile-nav-panel d-lg-none pt-3 pb-2 border-top mt-2">
            <div class="mb-3">
              <form (ngSubmit)="onSearchSubmit()">
                <input type="text"
                       [(ngModel)]="searchKeyword"
                       name="mobileSearchKeyword"
                       class="form-control rounded-pill px-3 py-2 fs-7"
                       placeholder="Tìm kiếm sách, tác giả...">
              </form>
            </div>
            <div class="d-flex flex-column gap-1">
              <a routerLink="/" (click)="closeMobileMenu()" class="nav-link-mobile py-2 px-3 rounded-3 text-decoration-none fs-7 text-dark fw-medium">
                <i class="fas fa-home me-2 text-primary"></i> Trang chủ
              </a>
              <a routerLink="/books" (click)="closeMobileMenu()" class="nav-link-mobile py-2 px-3 rounded-3 text-decoration-none fs-7 text-dark fw-medium">
                <i class="fas fa-book-open me-2 text-primary"></i> Tủ sách
              </a>
              <a routerLink="/about" (click)="closeMobileMenu()" class="nav-link-mobile py-2 px-3 rounded-3 text-decoration-none fs-7 text-dark fw-medium">
                <i class="fas fa-info-circle me-2 text-primary"></i> Giới thiệu
              </a>
              <a routerLink="/contact" (click)="closeMobileMenu()" class="nav-link-mobile py-2 px-3 rounded-3 text-decoration-none fs-7 text-dark fw-medium">
                <i class="fas fa-headset me-2 text-primary"></i> Liên hệ
              </a>
              <a routerLink="/my-orders" (click)="closeMobileMenu()" class="nav-link-mobile py-2 px-3 rounded-3 text-decoration-none fs-7 text-dark fw-medium">
                <i class="fas fa-box-open me-2 text-primary"></i> Đơn hàng của tôi
              </a>
            </div>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .storefront-header {
      z-index: 1020;
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }
    .brand-logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%) !important;
    }
    .brand-title {
      line-height: 1.1;
      letter-spacing: -0.3px;
    }
    .brand-subtitle {
      font-size: 0.68rem;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.75rem; }
    .fs-9 { font-size: 0.65rem; }

    .header-search-wrapper {
      position: relative;
      max-width: 280px;
      min-width: 180px;
      transition: max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;

      &.search-expanded {
        max-width: 680px !important;
      }
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      pointer-events: none;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-input {
      padding-left: 44px !important;
      padding-right: 24px !important;
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      text-overflow: ellipsis !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      transition: all 0.25s ease;

      &::-webkit-input-placeholder {
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        white-space: nowrap !important;
      }

      &::-moz-placeholder {
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        white-space: nowrap !important;
      }

      &::placeholder {
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        white-space: nowrap !important;
        color: #94a3b8;
      }

      &:focus {
        background-color: #ffffff;
        border-color: #1e40af;
        box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.12);
        &::placeholder {
          color: #cbd5e1;
        }
      }
    }

    .navbar-brand,
    .brand-title,
    .brand-subtitle,
    .user-actions {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
    }

    .main-nav {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      max-width: 500px;
      opacity: 1;
      transform: scale(1);
      transform-origin: right center;
      transition: max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.25s ease,
                  transform 0.3s ease,
                  margin 0.35s ease;
      overflow: hidden;

      &.nav-collapsed {
        max-width: 0 !important;
        opacity: 0 !important;
        transform: scale(0.92) translateX(15px) !important;
        margin: 0 !important;
        padding: 0 !important;
        pointer-events: none !important;
      }
    }

    .nav-link-item {
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 5px;
      flex-shrink: 0 !important;
      color: #475569;
      transition: all 0.2s ease;
      &:hover {
        color: #1e40af;
        background-color: #eff6ff;
      }
      &.active {
        color: #1e40af;
        background-color: #dbeafe;
        font-weight: 700 !important;
      }
    }

    .btn-action-icon {
      width: 40px;
      height: 40px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      &:hover {
        background-color: #eff6ff;
        border-color: #bfdbfe;
        transform: translateY(-2px);
      }
    }

    .dropdown-menu-custom {
      background: #ffffff;
      border: 1px solid #e2e8f0;
    }
    .dropdown-item-custom {
      transition: background 0.15s ease;
      &:hover {
        background-color: #f1f5f9;
      }
    }

    :host-context([data-theme="dark"]) {
      .storefront-header {
        background-color: #0b1329 !important;
        border-color: #1e293b !important;
      }
      .brand-title { color: #f8fafc !important; }
      .brand-subtitle { color: #94a3b8 !important; }
      .search-input {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        color: #f8fafc !important;
      }
      .nav-link-item {
        color: #cbd5e1;
        &:hover {
          color: #60a5fa;
          background-color: #1e293b;
        }
        &.active {
          color: #60a5fa;
          background-color: #1e293b;
        }
      }
      .btn-action-icon {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        &:hover {
          background-color: #1e293b !important;
        }
      }
      .dropdown-menu-custom {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        .text-dark { color: #f8fafc !important; }
        .text-muted { color: #94a3b8 !important; }
      }
      .dropdown-item-custom:hover {
        background-color: #1e293b !important;
      }
      .nav-link-mobile {
        color: #f8fafc !important;
        &:hover { background-color: #1e293b !important; }
      }
    }
  `]
})
export class UserHeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly configState = inject(ConfigStateService);
  private readonly permissionService = inject(PermissionService);
  private readonly cartStore = inject(CartSignalStore);
  readonly themeService = inject(ThemeService);

  cartCount = input<number>(0);
  wishlistCount = input<number>(0);
  unreadNotificationCount = input<number>(0);
  currentTheme = input<'light' | 'dark'>('light');

  searchSubmit = output<string>();
  themeToggle = output<void>();

  searchKeyword: string = '';
  isSearchFocused = signal<boolean>(false);
  isUserDropdownOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 200);
  }

  computedCartCount(): number {
    return this.cartCount() || this.cartStore.cart()?.totalCount || 0;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  isAdmin(): boolean {
    return this.permissionService.getGrantedPolicy('BookStore.Books.Create');
  }

  userName(): string {
    const user = this.configState.getOne('currentUser');
    return user?.userName || 'Tài khoản';
  }

  userEmail(): string {
    const user = this.configState.getOne('currentUser');
    return user?.email || '';
  }

  userInitial(): string {
    const name = this.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  onSearchSubmit(): void {
    const kw = (this.searchKeyword || '').trim();
    this.searchSubmit.emit(kw);
    this.router.navigate(['/books'], { queryParams: { filter: kw || null, page: 1 } });
    this.isMobileMenuOpen.set(false);
  }

  onThemeToggle(): void {
    this.themeService.toggleTheme();
    this.themeToggle.emit();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isUserDropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  login(): void {
    this.authService.navigateToLogin();
  }

  logout(): void {
    this.closeDropdown();
    this.router.navigate(['/logout']);
  }
}
