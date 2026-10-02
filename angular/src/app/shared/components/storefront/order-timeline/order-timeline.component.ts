import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTimelineStep } from '../../../models/storefront.models';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container py-3">
      <div class="d-flex justify-content-between position-relative">
        <div class="timeline-track position-absolute top-50 start-0 w-100 translate-middle-y"></div>

        @for (step of steps(); track step.stepIndex) {
          <div class="timeline-step text-center position-relative z-1 d-flex flex-column align-items-center"
               style="flex: 1;">
            
            <div class="step-circle rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                 [class.completed]="step.isCompleted"
                 [class.current]="step.isCurrent"
                 [class.pending]="!step.isCompleted && !step.isCurrent">
              @if (step.isCompleted) {
                <i class="fas fa-check"></i>
              } @else if (step.isCurrent) {
                <i class="fas fa-circle-notch fa-spin"></i>
              } @else {
                <span>{{ step.stepIndex }}</span>
              }
            </div>

            <div class="step-title fw-bold mt-2 fs-7"
                 [class.text-primary]="step.isCurrent || step.isCompleted"
                 [class.text-muted]="!step.isCompleted && !step.isCurrent">
              {{ step.title }}
            </div>

            @if (step.description) {
              <div class="step-desc fs-8 text-secondary mt-1 d-none d-md-block">
                {{ step.description }}
              </div>
            }

            @if (step.date) {
              <div class="step-date fs-8 text-muted mt-1">
                {{ step.date }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      width: 100%;
    }
    .timeline-track {
      height: 4px;
      background: #e2e8f0;
      z-index: 0;
    }
    .step-circle {
      width: 38px;
      height: 38px;
      font-weight: 700;
      font-size: 0.85rem;
      background: #ffffff;
      border: 2px solid #cbd5e1;
      color: #64748b;
      transition: all 0.3s ease;

      &.completed {
        background: #10b981;
        border-color: #10b981;
        color: #ffffff;
      }
      &.current {
        background: #1e40af;
        border-color: #1e40af;
        color: #ffffff;
        box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.2) !important;
      }
      &.pending {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }
    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.72rem; }

    :host-context([data-theme="dark"]) {
      .timeline-track {
        background: #1e293b !important;
      }
      .step-circle.pending {
        background: #0b1329 !important;
        border-color: #334155 !important;
        color: #94a3b8 !important;
      }
      .step-circle.current {
        background: #3b82f6 !important;
        border-color: #3b82f6 !important;
      }
      .step-desc {
        color: #94a3b8 !important;
      }
    }
  `]
})
export class OrderTimelineComponent {
  steps = input.required<OrderTimelineStep[]>();
}
