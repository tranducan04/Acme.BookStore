import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastType } from '../../../models/storefront.models';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 100000; pointer-events: none;">
      @for (toast of currentToasts(); track toast.id) {
        <div class="toast-item shadow-lg p-3 rounded-4 mb-2 d-flex align-items-center gap-3"
             [ngClass]="'toast-' + toast.type"
             style="pointer-events: auto; min-width: 320px; max-width: 420px; backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <div class="toast-icon-badge rounded-circle d-flex align-items-center justify-content-center"
               [ngClass]="getIconBg(toast.type)"
               style="width: 38px; height: 38px; flex-shrink: 0;">
            <i [class]="getIconClass(toast.type)"></i>
          </div>

          <div class="toast-content flex-grow-1">
            @if (toast.title) {
              <div class="fw-bold fs-6 mb-1 text-dark">{{ toast.title }}</div>
            }
            <div class="fs-7 text-secondary">{{ toast.message }}</div>
          </div>

          <button type="button" class="btn-close ms-auto" aria-label="Close" (click)="onDismiss(toast.id)"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toastIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-item {
      background: rgba(255, 255, 255, 0.95);
      transition: all 0.25s ease;
    }
    :host-context([data-theme="dark"]) .toast-item {
      background: rgba(17, 28, 68, 0.95);
      border-color: rgba(255, 255, 255, 0.1) !important;
      .text-dark { color: #f8fafc !important; }
      .text-secondary { color: #94a3b8 !important; }
      .btn-close { filter: invert(1); }
    }
    .toast-success { border-left: 4px solid #10b981 !important; }
    .toast-error { border-left: 4px solid #ef4444 !important; }
    .toast-warning { border-left: 4px solid #f59e0b !important; }
    .toast-info { border-left: 4px solid #3b82f6 !important; }
  `]
})
export class ToastNotificationComponent {
  private readonly toastService = inject(ToastService);

  toasts = input<ToastMessage[] | null>(null);
  dismiss = output<string>();

  currentToasts() {
    return this.toasts() !== null ? (this.toasts() || []) : this.toastService.toasts();
  }

  onDismiss(id: string): void {
    if (this.toasts() !== null) {
      this.dismiss.emit(id);
    } else {
      this.toastService.dismiss(id);
    }
  }

  getIconClass(type: ToastType): string {
    switch (type) {
      case 'success': return 'fas fa-check text-white';
      case 'error': return 'fas fa-exclamation text-white';
      case 'warning': return 'fas fa-exclamation-triangle text-white';
      case 'info':
      default: return 'fas fa-info text-white';
    }
  }

  getIconBg(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info':
      default: return 'bg-primary';
    }
  }
}
