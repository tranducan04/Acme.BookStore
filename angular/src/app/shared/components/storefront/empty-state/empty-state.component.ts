import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card text-center p-5 rounded-4 bg-white shadow-sm border border-light my-4">
      <div class="empty-icon-circle mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
           style="width: 76px; height: 76px;">
        <i [class]="'fas ' + icon() + ' fs-2'"></i>
      </div>
      <h4 class="fw-bold mb-2 text-dark">{{ title() }}</h4>
      @if (description()) {
        <p class="text-muted mb-4 mx-auto fs-6" style="max-width: 480px;">
          {{ description() }}
        </p>
      }
      @if (actionText()) {
        <button class="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm" (click)="actionClick.emit()">
          {{ actionText() }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host-context([data-theme="dark"]) .empty-state-card {
      background: #111c44 !important;
      border-color: #1e293b !important;
      .text-dark { color: #f8fafc !important; }
      .text-muted { color: #94a3b8 !important; }
      .empty-icon-circle {
        background: #1e293b !important;
        color: #60a5fa !important;
      }
    }
  `]
})
export class EmptyStateComponent {
  icon = input<string>('fa-box-open');
  title = input<string>('Không có dữ liệu');
  description = input<string>('');
  actionText = input<string | undefined>(undefined);

  actionClick = output<void>();
}
