import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-card p-3 rounded-4 bg-white border border-light shadow-sm text-center d-flex flex-column align-items-center justify-content-center h-100 cursor-pointer"
         (click)="onSelect()">
      <div class="category-icon-wrapper rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm text-primary">
        <i [class]="'fas ' + (category().icon || 'fa-bookmark') + ' fs-5'"></i>
      </div>
      <h6 class="fw-bold fs-7 text-dark mb-1 text-truncate w-100">{{ category().name }}</h6>
      @if (category().count !== undefined) {
        <span class="badge bg-light text-muted rounded-pill fs-9">{{ category().count }} cuốn</span>
      }
    </div>
  `,
  styles: [`
    .category-card {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      &:hover {
        transform: translateY(-4px);
        border-color: #bfdbfe !important;
        box-shadow: 0 12px 24px -8px rgba(30, 64, 175, 0.15) !important;
        .category-icon-wrapper {
          background: #1e40af !important;
          color: #ffffff !important;
          transform: scale(1.1);
        }
      }
    }
    .category-icon-wrapper {
      width: 52px;
      height: 52px;
      background: #eff6ff;
      transition: all 0.3s ease;
    }
    .fs-7 { font-size: 0.85rem; }
    .fs-9 { font-size: 0.68rem; }

    :host-context([data-theme="dark"]) {
      .category-card {
        background: #111c44 !important;
        border-color: #1e293b !important;
        .text-dark { color: #f8fafc !important; }
        .text-muted { color: #94a3b8 !important; }
        .bg-light { background: #1e293b !important; }
      }
      .category-icon-wrapper {
        background: #1e293b !important;
        color: #60a5fa !important;
      }
    }
  `]
})
export class CategoryCardComponent {
  category = input.required<{ id: string; name: string; icon: string; count?: number }>();
  selected = output<string>();

  onSelect(): void {
    this.selected.emit(this.category().id);
  }
}
