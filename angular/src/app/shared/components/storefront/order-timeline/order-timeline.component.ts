import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTimelineStep, OrderStatus } from '../../../models/storefront.models';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container py-3">
      <div class="timeline-row d-flex justify-content-between position-relative">
        @for (step of steps(); track step.stepIndex; let idx = $index; let last = $last) {
          <div class="timeline-col d-flex flex-column align-items-center text-center position-relative">
            
            <!-- Thanh nối sang bước kế tiếp -->
            @if (!last) {
              <div class="timeline-connector"
                   [class.active]="step.isCompleted">
              </div>
            }

            <!-- Hình tròn bước với icon line màu trắng tinh giản -->
            <div class="step-circle-wrapper position-relative d-flex align-items-center justify-content-center">
              <div class="step-circle rounded-circle d-flex align-items-center justify-content-center"
                   [class.completed]="step.isCompleted && step.status !== 'Cancelled'"
                   [class.current]="step.isCurrent && step.status !== 'Cancelled'"
                   [class.cancelled]="step.status === 'Cancelled'"
                   [class.pending]="!step.isCompleted && !step.isCurrent && step.status !== 'Cancelled'">
                <i [class]="getStepIcon(step.status)" class="step-icon"></i>
              </div>
            </div>

            <!-- Tên giai đoạn -->
            <div class="step-title mt-2.5 fs-7"
                 [class.title-completed]="step.isCompleted && !step.isCurrent && step.status !== 'Cancelled'"
                 [class.title-current]="step.isCurrent && step.status !== 'Cancelled'"
                 [class.title-cancelled]="step.status === 'Cancelled'"
                 [class.title-pending]="!step.isCompleted && !step.isCurrent && step.status !== 'Cancelled'">
              {{ step.title }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      width: 100%;
      padding: 0.75rem 0.5rem;
    }

    .timeline-row {
      width: 100%;
    }

    .timeline-col {
      flex: 1;
      position: relative;
    }

    .timeline-connector {
      position: absolute;
      top: 24px;
      left: calc(50% + 24px + 8px);
      right: calc(-50% + 24px + 8px);
      height: 4px;
      background-color: #e2e8f0;
      border-radius: 4px;
      transform: translateY(-50%);
      z-index: 1;
      transition: background-color 0.3s ease;

      &.active {
        background-color: #4338ca;
      }
    }

    .step-circle-wrapper {
      z-index: 2;
    }

    .step-circle {
      width: 48px;
      height: 48px;
      font-size: 1.15rem;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      color: #94a3b8;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.completed {
        background-color: #4338ca;
        border-color: #4338ca;
        color: #ffffff;
        box-shadow: 0 4px 10px rgba(67, 56, 202, 0.25);
      }

      &.current {
        background-color: #4338ca;
        border-color: #4338ca;
        color: #ffffff;
        box-shadow: 0 0 0 7px #e0e7ff, 0 4px 12px rgba(67, 56, 202, 0.3) !important;
      }

      &.cancelled {
        background-color: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
        box-shadow: 0 0 0 7px #fee2e2 !important;
      }

      &.pending {
        background-color: #f8fafc;
        border-color: #e2e8f0;
        color: #cbd5e1;
      }

      .step-icon {
        line-height: 1;
      }
    }

    .step-title {
      font-size: 0.85rem;
      line-height: 1.3;
      letter-spacing: -0.2px;
      user-select: none;

      &.title-completed {
        color: #1e293b;
        font-weight: 600;
      }

      &.title-current {
        color: #4338ca;
        font-weight: 700;
      }

      &.title-cancelled {
        color: #ef4444;
        font-weight: 700;
      }

      &.title-pending {
        color: #94a3b8;
        font-weight: 500;
      }
    }

    @media (max-width: 576px) {
      .step-circle {
        width: 38px;
        height: 38px;
        font-size: 0.95rem;
      }
      .timeline-connector {
        top: 19px;
        left: calc(50% + 19px + 6px);
        right: calc(-50% + 19px + 6px);
        height: 3px;
      }
      .step-title {
        font-size: 0.72rem;
      }
    }

    :host-context([data-theme="dark"]) {
      .timeline-connector {
        background-color: #1e293b;
        &.active {
          background-color: #6366f1;
        }
      }

      .step-circle {
        &.completed {
          background-color: #6366f1;
          border-color: #6366f1;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        &.current {
          background-color: #6366f1;
          border-color: #6366f1;
          box-shadow: 0 0 0 7px rgba(99, 102, 241, 0.25), 0 4px 12px rgba(99, 102, 241, 0.35) !important;
        }

        &.cancelled {
          background-color: #ef4444;
          border-color: #ef4444;
          box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.25) !important;
        }

        &.pending {
          background-color: #0b1329 !important;
          border-color: #1e293b !important;
          color: #475569 !important;
        }
      }

      .step-title {
        &.title-completed {
          color: #f1f5f9 !important;
        }

        &.title-current {
          color: #818cf8 !important;
        }

        &.title-cancelled {
          color: #f87171 !important;
        }

        &.title-pending {
          color: #64748b !important;
        }
      }
    }
  `]
})
export class OrderTimelineComponent {
  steps = input.required<OrderTimelineStep[]>();

  getStepIcon(status: OrderStatus): string {
    switch (status) {
      case 'Placed':
        return 'fas fa-shopping-cart';
      case 'Processing':
        return 'fas fa-box-open';
      case 'Shipped':
        return 'fas fa-truck';
      case 'Completed':
        return 'fas fa-check-circle';
      case 'Cancelled':
        return 'fas fa-times';
      default:
        return 'fas fa-circle';
    }
  }
}
