import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../proxy/notifications/notification.service';
import { NotificationDto } from '../../../proxy/notifications/models';
import { LocalizationPipe } from '@abp/ng.core';
import { NotificationTranslatePipe } from './notification-translate.pipe';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule, RouterModule, LocalizationPipe, NotificationTranslatePipe],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    public notifications = signal<NotificationDto[]>([]);
    public isLoading = signal<boolean>(false);
    public selectedFilter = signal<string>('all'); // all, unread, order, shipping

    // Lọc thông báo theo Tab
    public filteredNotifications = computed(() => {
        const filter = this.selectedFilter();
        const list = this.notifications();

        if (filter === 'unread') return list.filter(n => !n.isRead);
        if (filter === 'order') return list.filter(n => n.type === 0);
        if (filter === 'shipping') return list.filter(n => n.type === 1);
        return list;
    });

    public unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

    ngOnInit(): void {
        this.loadNotifications();
    }

    async loadNotifications() {
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

    async onNotificationClick(notif: NotificationDto) {
        if (!notif.id) return;

        // Đánh dấu đã đọc
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

        // Chuyển hướng đến trang đích (VD: /orders)
        if (notif.targetUrl) {
            this.router.navigateByUrl(notif.targetUrl);
        }
    }

    async markAllAsRead() {
        try {
            await firstValueFrom(this.notificationService.markAllAsRead());
            this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Lỗi khi đánh dấu đã đọc tất cả:', err);
        }
    }

    getIcon(type?: number): string {
        switch (type) {
            case 0: return '📦';
            case 1: return '🚚';
            case 2: return '⭐';
            default: return '🔔';
        }
    }
}
