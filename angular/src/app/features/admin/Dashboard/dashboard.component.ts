import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { trigger, transition, style, animate } from '@angular/animations';
import { BookService } from '../../../proxy/books/book.service';
import { OrderService } from '../../../proxy/orders/order.service';
import { OrderDto } from '../../../proxy/orders/models';
import { BookDto } from '../../../proxy/books/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('700ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private bookService = inject(BookService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  // 🌟 ViewChild tham chiếu tới 3 thẻ canvas vẽ biểu đồ
  @ViewChild('revenueBarChart') revenueBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryPieChart') categoryPieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orderStatusChart') orderStatusChartRef!: ElementRef<HTMLCanvasElement>;

  private barChartInstance: Chart | null = null;
  private categoryChartInstance: Chart | null = null;
  private statusChartInstance: Chart | null = null;

  // Signals Dữ liệu Thống kê
  public totalRevenue = signal<number>(0);
  public totalOrdersCount = signal<number>(0);
  public pendingOrdersCount = signal<number>(0);
  public totalBooksCount = signal<number>(0);
  public recentOrders = signal<OrderDto[]>([]);
  public isRefreshing = signal<boolean>(false);

  // Signals Modal Popup lọc đơn hàng theo thẻ
  public isFilterModalOpen = signal<boolean>(false);
  public modalTitle = signal<string>('');
  public filteredModalOrders = signal<OrderDto[]>([]);

  private bookTypeNames: Record<number, string> = {
    0: 'Chưa rõ',
    1: 'Tiểu sử',
    2: 'Kỳ ảo',
    3: 'Lịch sử',
    4: 'Kinh dị',
    5: 'Khoa học',
    6: 'Thơ ca',
    7: 'Phiêu lưu'
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.barChartInstance?.destroy();
    this.categoryChartInstance?.destroy();
    this.statusChartInstance?.destroy();
    this.barChartInstance = null;
    this.categoryChartInstance = null;
    this.statusChartInstance = null;
  }


  loadDashboardData(): void {
    this.isRefreshing.set(true);
    // Gọi song song 2 API cùng lúc (cực nhanh, không chờ nhau)
    forkJoin({
      bookRes: this.bookService.getList({ maxResultCount: 1000 }),
      orderRes: this.orderService.getList({ maxResultCount: 1000 })
    }).subscribe({
      next: ({ bookRes, orderRes }) => {
        const books: BookDto[] = bookRes.items || [];
        const orders: OrderDto[] = orderRes.items || [];
        this.totalBooksCount.set(bookRes.totalCount || 0);
        this.totalOrdersCount.set(orders.length);
        this.recentOrders.set(orders.slice(0, 5));
        const validOrders = orders.filter((o: OrderDto) => o.status !== 4);
        const revenue = validOrders.reduce((sum: number, o: OrderDto) => sum + (o.totalAmount || 0), 0);
        this.totalRevenue.set(revenue);
        const pending = orders.filter((o: OrderDto) => o.status === 0 || o.status === 1).length;
        this.pendingOrdersCount.set(pending);
        // 🌟 Kích hoạt hiệu ứng chuyển động Animation mọc lên sau khi giao diện và thẻ card ổn định kích thước (350ms)
        setTimeout(() => {
          this.renderRevenueBarChart(validOrders);
          this.renderCategoryChart(validOrders, books);
          this.renderStatusChart(orders);
        }, 100);
        this.isRefreshing.set(false);

      },
      error: () => {
        this.isRefreshing.set(false);
      }
    });
  }
  refreshData(): void {
    this.loadDashboardData();
  }

  // 📊 1. BIỂU ĐỒ CỘT: Doanh thu 12 tháng
  private renderRevenueBarChart(orders: OrderDto[]): void {
    if (!this.revenueBarChartRef) return;
    if (this.barChartInstance) this.barChartInstance.destroy();

    const monthlyRevenue: Record<string, number> = {};
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    months.forEach(m => monthlyRevenue[m] = 0);

    orders.forEach(o => {
      if (o.creationTime) {
        const d = new Date(o.creationTime);
        const monthKey = `T${d.getMonth() + 1}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (o.totalAmount || 0);
      }
    });

    const ctx = this.revenueBarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: months.map(m => monthlyRevenue[m]),
          backgroundColor: 'rgba(67, 24, 255, 0.85)',
          borderRadius: 8,
          hoverBackgroundColor: '#3311cc'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: {
          duration: 1200,
          easing: 'easeOutBounce',
          delay: (context) => context.dataIndex * 80
        },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => Number(value).toLocaleString('vi-VN') + ' đ'
            },
            grid: { color: '#f1f5f9' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 🍩 2. BIỂU ĐỒ DONUT: Cơ cấu theo Thể loại Sách bán ra
  private renderCategoryChart(orders: OrderDto[], books: BookDto[]): void {
    if (!this.categoryPieChartRef) return;
    if (this.categoryChartInstance) this.categoryChartInstance.destroy();

    const bookTypeMap = new Map<string, number>();
    books.forEach(b => {
      if (b.id) bookTypeMap.set(b.id, b.type ?? 0);
    });

    const categorySales: Record<string, number> = {};
    Object.values(this.bookTypeNames).forEach(name => categorySales[name] = 0);

    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.bookId && bookTypeMap.has(item.bookId)) {
          const typeNumber = bookTypeMap.get(item.bookId)!;
          const typeName = this.bookTypeNames[typeNumber] || 'Khác';
          categorySales[typeName] = (categorySales[typeName] || 0) + (item.count || 1);
        }
      });
    });

    const activeCategories = Object.keys(categorySales).filter(k => categorySales[k] > 0);
    const chartLabels = activeCategories.length > 0 ? activeCategories : ['Chưa có dữ liệu'];
    const chartData = activeCategories.length > 0 ? activeCategories.map(k => categorySales[k]) : [1];

    const ctx = this.categoryPieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: [
            '#4318ff', '#01b574', '#ffb547', '#ee5d50', '#00c6ff', '#8b5cf6', '#ec4899', '#64748b'
          ],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1400,
          easing: 'easeOutCirc'
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        },
        cutout: '60%'
      }
    });
  }

  // 🥧 3. BIỂU ĐỒ TRÒN: Tỷ lệ Trạng thái Đơn hàng
  private renderStatusChart(orders: OrderDto[]): void {
    if (!this.orderStatusChartRef) return;
    if (this.statusChartInstance) this.statusChartInstance.destroy();

    const statusCounts = {
      'Chờ duyệt': orders.filter(o => o.status === 0).length,
      'Đang giao': orders.filter(o => o.status === 1).length,
      'Hoàn thành': orders.filter(o => o.status === 2 || o.status === 3).length,
      'Đã hủy': orders.filter(o => o.status === 4).length,
    };

    const ctx = this.orderStatusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.statusChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1400,
          easing: 'easeOutCirc'
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        }
      }
    });
  }

  openOrdersModal(type: 'all' | 'pending' | 'completed' | 'books'): void {
    if (type === 'books') {
      this.router.navigate(['/books']);
      return;
    }

    this.orderService.getList({ maxResultCount: 1000 }).subscribe({
      next: (res) => {
        const orders: OrderDto[] = res.items || [];
        if (type === 'all') {
          this.modalTitle.set('📦 Danh Sách Tất Cả Đơn Hàng');
          this.filteredModalOrders.set(orders);
        } else if (type === 'pending') {
          this.modalTitle.set('⏳ Danh Sách Đơn Hàng Cần Xử Lý (Chờ duyệt / Đang giao)');
          this.filteredModalOrders.set(orders.filter((o: OrderDto) => o.status === 0 || o.status === 1));
        } else if (type === 'completed') {
          this.modalTitle.set('✅ Danh Sách Đơn Hàng Đã Bán / Hoàn Thành');
          this.filteredModalOrders.set(orders.filter((o: OrderDto) => o.status === 2 || o.status === 3));
        }
        this.isFilterModalOpen.set(true);
      }
    });
  }

  closeModal(): void {
    this.isFilterModalOpen.set(false);
  }

  getStatusClass(status?: number): string {
    if (status === undefined || status === null) return 'bg-secondary';
    const map: Record<number, string> = {
      0: 'bg-warning text-dark',
      1: 'bg-info text-white',
      2: 'bg-success text-white',
      3: 'bg-primary text-white',
      4: 'bg-danger text-white'
    };
    return map[status] || 'bg-secondary text-white';
  }

  getStatusText(status?: number): string {
    if (status === undefined || status === null) return 'Chưa rõ';
    const map: Record<number, string> = {
      0: 'Chờ duyệt',
      1: 'Đang giao',
      2: 'Hoàn thành',
      3: 'Đã thanh toán',
      4: 'Đã hủy'
    };
    return map[status] || 'Chưa rõ';
  }
}
