import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating d-inline-flex align-items-center gap-1"
         [class.interactive]="!readOnly()"
         (mouseleave)="onMouseLeave()">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <i class="fa-star fs-7 transition-all"
           [class.fas]="isFilled(star)"
           [class.far]="!isFilled(star)"
           [class.text-warning]="isFilled(star)"
           [class.text-muted]="!isFilled(star)"
           (mouseenter)="onMouseEnter(star)"
           (click)="onClick(star)"></i>
      }
      @if (showScore()) {
        <span class="ms-1 fw-bold fs-7 text-secondary">
          {{ displayRating() | number:'1.1-1' }}
        </span>
      }
    </div>
  `,
  styles: [`
    .fs-7 { font-size: 0.85rem; }
    .interactive i {
      cursor: pointer;
      transition: transform 0.15s ease;
      &:hover {
        transform: scale(1.25);
      }
    }
  `]
})
export class StarRatingComponent {
  rating = input<number>(5);
  readOnly = input<boolean>(true);
  showScore = input<boolean>(true);

  ratingChange = output<number>();

  hoveredStar = signal<number | null>(null);

  isFilled(starIndex: number): boolean {
    const current = this.hoveredStar() !== null ? this.hoveredStar()! : this.rating();
    return starIndex <= Math.round(current || 0);
  }

  displayRating(): number {
    return this.hoveredStar() !== null ? this.hoveredStar()! : this.rating();
  }

  onMouseEnter(star: number): void {
    if (!this.readOnly()) {
      this.hoveredStar.set(star);
    }
  }

  onMouseLeave(): void {
    if (!this.readOnly()) {
      this.hoveredStar.set(null);
    }
  }

  onClick(star: number): void {
    if (!this.readOnly()) {
      this.ratingChange.emit(star);
    }
  }
}
