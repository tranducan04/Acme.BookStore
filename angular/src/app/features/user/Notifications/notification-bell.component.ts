import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../proxy/notifications/notification.service';
import { NotificationDto } from '../../../proxy/notifications/models';

import { LocalizationPipe } from '@abp/ng.core';
import { NotificationTranslatePipe } from './notification-translate.pipe';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizationPipe, NotificationTranslatePipe],
  template: `
    <div class="notification-bell-container position-relative d-flex align-items-center">
      <!-- 🔔 NÚT CHUÔNG -->
      <button type="button" class="btn-bell" (click)="toggleDropdown()" [title]="'::Notifications:Title' | abpLocalization">
        <span class="bell-icon">🔔</span>
        @if (unreadCount() > 0) {
          <span class="unread-badge animate-pulse">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      <!-- 📋 DROPDOWN MENU -->
      @if (isOpen()) {
        <!-- Backdrop để click ra ngoài đóng dropdown -->
        <div class="dropdown-backdrop" (click)="isOpen.set(false)"></div>

        <div class="notification-dropdown shadow-lg rounded-4 overflow-hidden border">
          <!-- Header -->
          <div class="dropdown-header p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <h6 class="mb-0 fw-bold text-dark">{{ '::Notifications:Title' | abpLocalization }}</h6>
              @if (unreadCount() > 0) {
                <span class="badge bg-danger rounded-pill">{{ unreadCount() }} {{ '::Notifications:NewCount' | abpLocalization }}</span>
              }
            </div>
            @if (unreadCount() > 0) {
              <button class="btn btn-link btn-sm text-decoration-none p-0 text-primary small fw-semibold" (click)="markAllAsRead()">
                {{ '::Notifications:MarkAllRead' | abpLocalization }}
              </button>
            }
          </div>

          <!-- Danh sách thông báo -->
          <div class="notification-list overflow-auto" style="max-height: 360px;">
            @if (isLoading()) {
              <div class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
            } @else if (notifications().length === 0) {
              <div class="text-center py-4 px-3 text-muted">
                <div class="fs-2 mb-1">🔕</div>
                <p class="small mb-0">{{ '::Notifications:NoData' | abpLocalization }}</p>
              </div>
            } @else {
              @for (notif of notifications(); track notif.id) {
                <div class="notification-item p-3 border-bottom d-flex gap-2.5 cursor-pointer"
                  [class.unread]="!notif.isRead"
                  (click)="onNotificationClick(notif)">
                  
                  <div class="notif-icon-box rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    [ngClass]="{
                      'bg-primary-subtle': notif.type === 0,
                      'bg-warning-subtle': notif.type === 1,
                      'bg-success-subtle': notif.type === 2,
                      'bg-info-subtle': notif.type === 3
                    }">
                    <span>{{ notif.type === 0 ? '📦' : notif.type === 1 ? '🚚' : notif.type === 2 ? '⭐' : '🔔' }}</span>
                  </div>

                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex justify-content-between align-items-baseline mb-1">
                      <strong class="text-dark small text-truncate notif-title" [class.fw-bold]="!notif.isRead">{{ notif.title | notifTranslate:'title' }}</strong>
                      <small class="text-muted notif-time ms-1 flex-shrink-0">{{ notif.creationTime | date:'HH:mm dd/MM' }}</small>
                    </div>
                    <p class="mb-0 text-muted small text-truncate notif-msg">{{ notif.message | notifTranslate:'message' }}</p>
                  </div>

                  @if (!notif.isRead) {
                    <div class="unread-dot rounded-circle bg-danger flex-shrink-0 align-self-center"></div>
                  }
                </div>
              }
            }
          </div>

          <!-- Footer xem tất cả -->
          <div class="p-2 bg-light text-center border-top">
            <a routerLink="/notifications" (click)="isOpen.set(false)" class="small text-primary fw-bold text-decoration-none">
              {{ '::Notifications:ViewAll' | abpLocalization }} ➔
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-bell-container {
      margin-right: 0.75rem;
    }

    .btn-bell {
      background: transparent;
      border: none;
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
        transform: scale(1.05);
      }

      .bell-icon {
        font-size: 1.25rem;
      }
    }

    .unread-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      padding: 0 3px;
    }

    .dropdown-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 1050;
    }

    .notification-dropdown {
      position: absolute;
      top: 45px;
      right: 0;
      width: 330px;
      background: white;
      z-index: 1060;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
    }

    .notification-item {
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: #f8fafc;
      }

      &.unread {
        background-color: #eff6ff;
      }
    }

    .notif-icon-box {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
    }

    .notif-title {
      font-size: 0.825rem;
    }

    .notif-msg {
      font-size: 0.775rem;
    }

    .notif-time {
      font-size: 0.675rem;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  public isOpen = signal<boolean>(false);
  public notifications = signal<NotificationDto[]>([]);
  public unreadCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadUnreadCount();
    // Tự động quét thông báo mới mỗi 15 giây
    setInterval(() => this.loadUnreadCount(), 15000);
  }

  async loadNotifications() {
    this.isLoading.set(true);
    try {
      const items = await firstValueFrom(this.notificationService.getMyNotifications());
      this.notifications.set(items || []);
      this.unreadCount.set(this.notifications().filter(n => !n.isRead).length);
    } catch (err) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadUnreadCount() {
    try {
      const count = await firstValueFrom(this.notificationService.getUnreadCount());
      this.unreadCount.set(count || 0);
    } catch (err) { }
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.loadNotifications();
    }
  }

  async onNotificationClick(notif: NotificationDto) {
    if (!notif.id) return;

    if (!notif.isRead) {
      await firstValueFrom(this.notificationService.markAsRead(notif.id));
      notif.isRead = true;
      this.unreadCount.update(c => Math.max(0, c - 1));
    }

    this.isOpen.set(false);

    if (notif.targetUrl) {
      this.router.navigateByUrl(notif.targetUrl);
    }
  }

  async markAllAsRead() {
    try {
      await firstValueFrom(this.notificationService.markAllAsRead());
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      this.unreadCount.set(0);
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  }
}
