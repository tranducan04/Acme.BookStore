import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar-container position-relative w-100">
      <input type="text"
             [value]="query()"
             (input)="onInputChange($event)"
             (keyup.enter)="onSubmit()"
             class="form-control rounded-pill pe-5 py-2 fs-7"
             [placeholder]="placeholder()">
      
      <div class="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center gap-1">
        @if (query()) {
          <button type="button"
                  class="btn btn-sm btn-clear p-0 text-muted rounded-circle d-flex align-items-center justify-content-center border-0"
                  (click)="onClear()"
                  style="width: 24px; height: 24px;"
                  aria-label="Xóa từ khóa">
            <i class="fas fa-times fs-8"></i>
          </button>
        }
        <button type="button"
                class="btn btn-search p-0 text-primary rounded-circle d-flex align-items-center justify-content-center border-0"
                (click)="onSubmit()"
                style="width: 32px; height: 32px;"
                aria-label="Tìm kiếm">
          <i class="fas fa-search fs-7"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.72rem; }
    .form-control {
      padding-left: 10px !important;
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      transition: all 0.2s ease;
      &:focus {
        border-color: #1e40af;
        box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.12);
      }
    }
    .btn-search {
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.1);
      }
    }
    :host-context([data-theme="dark"]) {
      .form-control {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        color: #f8fafc !important;
        &:focus {
          border-color: #3b82f6 !important;
        }
      }
      .text-muted { color: #94a3b8 !important; }
    }
  `]
})
export class SearchBarComponent implements OnDestroy {
  placeholder = input<string>('Tìm kiếm tựa sách, tác giả, thể loại...');
  initialValue = input<string>('');

  search = output<string>();

  query = signal<string>('');
  private debounceTimer: any = null;

  constructor() {
    effect(() => {
      const init = this.initialValue();
      this.query.set(init || '');
    });
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.onSubmit();
    }, 750); // Tự động tìm kiếm sau 0.75s ngừng nhập
  }

  onSubmit(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.search.emit(this.query().trim());
  }

  onClear(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.query.set('');
    this.search.emit('');
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
