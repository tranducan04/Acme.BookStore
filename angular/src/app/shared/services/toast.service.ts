import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../models/storefront.models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastType = 'info', title?: string, durationMs: number = 3500): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      durationMs,
      timestamp: Date.now()
    };

    this.toasts.update(current => [...current, newToast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }

    return id;
  }

  showSuccess(message: string, title?: string, durationMs: number = 3500): string {
    return this.show(message, 'success', title, durationMs);
  }

  showError(message: string, title?: string, durationMs: number = 4500): string {
    return this.show(message, 'error', title, durationMs);
  }

  showInfo(message: string, title?: string, durationMs: number = 3500): string {
    return this.show(message, 'info', title, durationMs);
  }

  showWarning(message: string, title?: string, durationMs: number = 4000): string {
    return this.show(message, 'warning', title, durationMs);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
