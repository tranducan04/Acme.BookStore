import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../proxy/notifications/notification.service';
import { NotificationDto } from '../../../proxy/notifications/models';
import { ToastService } from '../../../shared/services/toast.service';
import { NotificationTranslatePipe } from './notification-translate.pipe';
import { EmptyStateComponent } from '../../../shared/components/storefront/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);
  readonly router = inject(Router);

  readonly notifications = signal<NotificationDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedFilter = signal<'all' | 'unread' | 'order' | 'promo'>('all');

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  readonly filteredNotifications = computed(() => {
    const f = this.selectedFilter();
    const list = this.notifications();

    if (f === 'unread') return list.filter(n => !n.isRead);
    if (f === 'order') return list.filter(n => n.type === 0 || n.type === 1);
    if (f === 'promo') return list.filter(n => n.type === 2);
    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  async loadNotifications(): Promise<void> {
    this.isLoading.set(true);
    try {
      const items = await firstValueFrom(this.notificationService.getMyNotifications());
      this.notifications.set(items || []);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onNotificationClick(notif: NotificationDto): Promise<void> {
    if (!notif.id) return;

    if (!notif.isRead) {
      try {
        await firstValueFrom(this.notificationService.markAsRead(notif.id));
        this.notifications.update(list =>
          list.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err);
      }
    }

    if (notif.targetUrl) {
      this.router.navigateByUrl(notif.targetUrl);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(this.notificationService.markAllAsRead());
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      this.toastService.showSuccess('Đã đánh dấu tất cả thông báo là đã đọc!');
    } catch {
      this.toastService.showError('Không thể thực hiện thao tác này.');
    }
  }

  getCategoryBadge(type?: number): { label: string; class: string; icon: string } {
    switch (type) {
      case 0:
        return { label: 'Đơn hàng mới', class: 'bg-primary-subtle text-primary', icon: 'fa-box' };
      case 1:
        return { label: 'Vận chuyển', class: 'bg-info-subtle text-info', icon: 'fa-truck' };
      case 2:
        return { label: 'Ưu đãi & Khuyến mãi', class: 'bg-warning-subtle text-warning', icon: 'fa-gift' };
      default:
        return { label: 'Hệ thống', class: 'bg-secondary-subtle text-secondary', icon: 'fa-bell' };
    }
  }
}
