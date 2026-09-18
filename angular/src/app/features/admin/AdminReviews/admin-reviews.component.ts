import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { trigger, transition, style, animate } from '@angular/animations';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { BookReviewDto } from '../../../proxy/book-reviews/models';
import { LocalizationPipe } from '@abp/ng.core';

Chart.register(...registerables);

@Component({
    selector: 'app-admin-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule, LocalizationPipe],
    templateUrl: './admin-reviews.component.html',
    styleUrls: ['./admin-reviews.component.scss'],
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(30px)' }),
                animate('700ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class AdminReviewsComponent implements OnInit, AfterViewInit, OnDestroy {
    private reviewService = inject(BookReviewService);

    @ViewChild('ratingBarChart') ratingBarChartRef!: ElementRef<HTMLCanvasElement>;
    private chartInstance: Chart | null = null;
    public reviews = signal<BookReviewDto[]>([]);
    public isLoading = signal<boolean>(false);
    public isDeleting = signal<boolean>(false);
    // Bộ lọc
    public searchTerm = signal<string>('');
    public selectedRating = signal<number>(0); // 0 = Tất cả
    public currentPage = signal<number>(1);
    public pageSize = signal<number>(10);
    // Computed: Điểm đánh giá trung bình
    public averageRating = computed(() => {
        const list = this.reviews();
        if (list.length === 0) return '0.0';
        const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0);
        return (sum / list.length).toFixed(1);
    });
    // Computed: Danh sách sau khi lọc
    public filteredReviews = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        const rating = Number(this.selectedRating());
        return this.reviews().filter(r => {
            const matchSearch = !term || (r.bookName && r.bookName.toLowerCase().includes(term));
            const matchRating = rating === 0 || r.rating === rating;
            return matchSearch && matchRating;
        });
    });
    // Computed: Phân trang
    public paginatedReviews = computed(() => {
        const list = this.filteredReviews();
        const start = (this.currentPage() - 1) * this.pageSize();
        return list.slice(start, start + this.pageSize());
    });
    public totalPages = computed(() => Math.ceil(this.filteredReviews().length / this.pageSize()) || 1);
    public totalCount = computed(() => this.filteredReviews().length);

    ngOnInit(): void {
        this.loadReviews();
    }

    ngAfterViewInit(): void {
        // 🌟 Khởi tạo ngay khung biểu đồ rỗng (mức 0) khi View vừa mount để triệt xóa 100% khoảng trắng delay
        this.initEmptyRatingChart();
    }

    ngOnDestroy(): void {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    async loadReviews() {
        this.isLoading.set(true);
        try {
            const res = await firstValueFrom(
                this.reviewService.getListAdmin({ maxResultCount: 1000, skipCount: 0 })
            );
            this.reviews.set(res?.items || []);
            // 📊 Cập nhật dữ liệu API ➔ Các cột từ mức 0 bắt đầu nảy mọc tưng bừng
            this.updateRatingChart();
        } catch (err) {
            console.error('Lỗi khi tải danh sách đánh giá:', err);
        } finally {
            this.isLoading.set(false);
        }
    }

    // 📊 Khởi tạo biểu đồ khung rỗng ngay lập tức
    private initEmptyRatingChart(): void {
        if (!this.ratingBarChartRef) return;
        if (this.chartInstance) return;

        const ctx = this.ratingBarChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 ⭐ (Rất tệ)', '2 ⭐ (Kém)', '3 ⭐ (Bình thường)', '4 ⭐ (Tốt)', '5 ⭐ (Tuyệt vời)'],
                datasets: [{
                    label: 'Số lượng đánh giá',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'
                    ],
                    borderRadius: 8,
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        '#dc2626', '#ea580c', '#d97706', '#2563eb', '#059669'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 200,
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce',
                    delay: (context) => context.dataIndex * 180
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (item) => ` ${item.raw} lượt đánh giá`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 5,
                        ticks: { stepSize: 1, precision: 0 },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 📊 Cập nhật dữ liệu từ API và kích hoạt animation mọc nảy
    private updateRatingChart(): void {
        const list = this.reviews();
        const starCounts = [
            list.filter(r => r.rating === 1).length,
            list.filter(r => r.rating === 2).length,
            list.filter(r => r.rating === 3).length,
            list.filter(r => r.rating === 4).length,
            list.filter(r => r.rating === 5).length,
        ];

        if (!this.chartInstance) {
            this.initEmptyRatingChart();
        }

        if (this.chartInstance) {
            this.chartInstance.data.datasets[0].data = starCounts;
            if (this.chartInstance.options.scales?.['y']) {
                this.chartInstance.options.scales['y'].suggestedMax = Math.max(5, ...starCounts) + 1;
            }
            this.chartInstance.update();
        }
    }

    onFilterChange() {
        this.currentPage.set(1);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    async deleteReview(id?: string, bookTitle?: string) {
        if (!id) return;
        if (confirm(`❓ Bạn có chắc chắn muốn xóa đánh giá của sách "${bookTitle || 'này'}" không?`)) {
            this.isDeleting.set(true);
            try {
                await firstValueFrom(this.reviewService.delete(id));
                this.reviews.update(list => list.filter(r => r.id !== id));
                this.updateRatingChart(); // Cập nhật lại biểu đồ
            } catch (err: any) {
                alert('❌ Không thể xóa đánh giá: ' + (err?.error?.error?.message || err?.message));
            } finally {
                this.isDeleting.set(false);
            }
        }
    }
}
