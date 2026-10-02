import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type() === 'card') {
      <div class="row g-4">
        @for (item of items(); track item) {
          <div class="col-6 col-md-4 col-lg-3">
            <div class="skeleton-card p-3 rounded-4 bg-white shadow-sm border border-light">
              <div class="shimmer-box rounded-3 mb-3" style="aspect-ratio: 3/4; width: 100%;"></div>
              <div class="shimmer-box rounded-pill mb-2" style="height: 16px; width: 75%;"></div>
              <div class="shimmer-box rounded-pill mb-3" style="height: 12px; width: 45%;"></div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="shimmer-box rounded-pill" style="height: 20px; width: 40%;"></div>
                <div class="shimmer-box rounded-circle" style="width: 36px; height: 36px;"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (type() === 'list') {
      <div class="d-flex flex-column gap-3">
        @for (item of items(); track item) {
          <div class="skeleton-list-item p-3 rounded-4 bg-white shadow-sm border border-light d-flex align-items-center gap-3">
            <div class="shimmer-box rounded-3" style="width: 70px; height: 90px; flex-shrink: 0;"></div>
            <div class="flex-grow-1">
              <div class="shimmer-box rounded-pill mb-2" style="height: 18px; width: 50%;"></div>
              <div class="shimmer-box rounded-pill mb-2" style="height: 14px; width: 30%;"></div>
              <div class="shimmer-box rounded-pill" style="height: 14px; width: 20%;"></div>
            </div>
          </div>
        }
      </div>
    } @else if (type() === 'detail') {
      <div class="row g-5">
        <div class="col-md-5">
          <div class="shimmer-box rounded-4" style="aspect-ratio: 3/4; width: 100%;"></div>
        </div>
        <div class="col-md-7">
          <div class="shimmer-box rounded-pill mb-3" style="height: 32px; width: 80%;"></div>
          <div class="shimmer-box rounded-pill mb-4" style="height: 18px; width: 40%;"></div>
          <div class="shimmer-box rounded-3 mb-4" style="height: 60px; width: 100%;"></div>
          <div class="shimmer-box rounded-pill mb-2" style="height: 14px; width: 100%;"></div>
          <div class="shimmer-box rounded-pill mb-2" style="height: 14px; width: 95%;"></div>
          <div class="shimmer-box rounded-pill mb-4" style="height: 14px; width: 70%;"></div>
          <div class="d-flex gap-3 mt-4">
            <div class="shimmer-box rounded-pill" style="height: 48px; width: 160px;"></div>
            <div class="shimmer-box rounded-pill" style="height: 48px; width: 160px;"></div>
          </div>
        </div>
      </div>
    } @else if (type() === 'banner') {
      <div class="shimmer-box rounded-4 mb-4" style="height: 320px; width: 100%;"></div>
    }
  `,
  styles: [`
    .shimmer-box {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    :host-context([data-theme="dark"]) {
      .skeleton-card, .skeleton-list-item {
        background: #111c44 !important;
        border-color: #1e293b !important;
      }
      .shimmer-box {
        background: linear-gradient(90deg, #1e293b 25%, #27354d 50%, #1e293b 75%);
        background-size: 200% 100%;
      }
    }
  `]
})
export class LoadingSkeletonComponent {
  type = input<'card' | 'list' | 'detail' | 'banner'>('card');
  count = input<number>(4);

  items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
