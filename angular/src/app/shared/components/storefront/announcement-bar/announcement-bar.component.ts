import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <div class="announcement-bar py-2 px-3 text-center position-relative d-flex align-items-center justify-content-center">
        <div class="d-flex align-items-center gap-2 fs-7 fw-medium text-white">
          <i class="fas fa-gift text-warning animate-bounce"></i>
          <span>{{ message() }}</span>
        </div>
        @if (dismissible()) {
          <button type="button"
                  class="btn-close-custom position-absolute end-0 me-3 border-0 bg-transparent text-white opacity-75"
                  (click)="dismiss()"
                  aria-label="Đóng thông báo">
            <i class="fas fa-times fs-7"></i>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    .announcement-bar {
      background: linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #1e40af 100%);
      min-height: 38px;
      z-index: 1025;
    }
    .fs-7 { font-size: 0.85rem; }
    .btn-close-custom {
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s ease;
      &:hover { opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .animate-bounce {
      animation: bounce 2s infinite;
    }
  `]
})
export class AnnouncementBarComponent {
  message = input<string>('🎉 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 250.000₫! Nhập mã BOOK2026 giảm thêm 15%');
  dismissible = input<boolean>(true);

  closed = output<void>();

  isVisible = signal<boolean>(true);

  dismiss(): void {
    this.isVisible.set(false);
    this.closed.emit();
  }
}
