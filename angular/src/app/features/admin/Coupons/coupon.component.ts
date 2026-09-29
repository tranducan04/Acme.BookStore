import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CoreModule } from '@abp/ng.core';
import { firstValueFrom } from 'rxjs';
import { CouponService } from '../../../proxy/coupons/coupon.service';
import { CouponDto, CreateUpdateCouponDto, DiscountType } from '../../../proxy/coupons/models';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.scss',
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CouponComponent implements OnInit {
  private couponService = inject(CouponService);
  public DiscountType = DiscountType;

  // 🌟 SIGNALS QUẢN LÝ DỮ LIỆU & TRẠNG THÁI
  public coupons = signal<CouponDto[]>([]);
  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public filterActive = signal<string>('all'); // 'all' | 'active' | 'inactive'

  // 🌟 COMPUTED SIGNAL: Lọc tìm kiếm mã giảm giá
  public filteredCoupons = computed(() => {
    let list = [...this.coupons()];
    const term = this.searchTerm().trim().toLowerCase();
    const activeFilter = this.filterActive();

    if (term) {
      list = list.filter(c =>
        c.code?.toLowerCase().includes(term) ||
        c.title?.toLowerCase().includes(term)
      );
    }

    if (activeFilter === 'active') {
      list = list.filter(c => c.isActive);
    } else if (activeFilter === 'inactive') {
      list = list.filter(c => !c.isActive);
    }

    return list;
  });

  // Modal State Signals
  public isModalOpen = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);

  // Form Field Signals
  public selectedId = signal<string | null>(null);
  public formCode = signal<string>('');
  public formTitle = signal<string>('');
  public formDiscountType = signal<DiscountType>(DiscountType.Percentage);
  public formDiscountValue = signal<number>(10);
  public formMaxDiscountAmount = signal<number | null>(null);
  public formMinOrderAmount = signal<number>(0);
  public formMaxUsageCount = signal<number>(100);
  public formStartDate = signal<string>('');
  public formEndDate = signal<string>('');
  public formIsActive = signal<boolean>(true);
  public formError = signal<string>('');

  ngOnInit(): void {
    this.loadCoupons();
  }

  async loadCoupons() {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.couponService.getList({ maxResultCount: 1000 }));
      this.coupons.set(res.items || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách mã giảm giá:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.formCode.set('');
    this.formTitle.set('');
    this.formDiscountType.set(DiscountType.Percentage);
    this.formDiscountValue.set(10);
    this.formMaxDiscountAmount.set(null);
    this.formMinOrderAmount.set(0);
    this.formMaxUsageCount.set(100);

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    this.formStartDate.set(today.toISOString().split('T')[0]);
    this.formEndDate.set(future.toISOString().split('T')[0]);
    this.formIsActive.set(true);
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(c: CouponDto) {
    this.isEditMode.set(true);
    this.selectedId.set(c.id || null);
    this.formCode.set(c.code);
    this.formTitle.set(c.title);
    this.formDiscountType.set(c.discountType);
    this.formDiscountValue.set(c.discountValue);
    this.formMaxDiscountAmount.set(c.maxDiscountAmount || null);
    this.formMinOrderAmount.set(c.minOrderAmount);
    this.formMaxUsageCount.set(c.maxUsageCount);
    this.formStartDate.set(c.startDate ? c.startDate.split('T')[0] : '');
    this.formEndDate.set(c.endDate ? c.endDate.split('T')[0] : '');
    this.formIsActive.set(c.isActive);
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async saveCoupon() {
    const code = this.formCode().trim().toUpperCase();
    const title = this.formTitle().trim();

    if (!code) {
      this.formError.set('Vui lòng nhập Mã giảm giá.');
      return;
    }
    if (!title) {
      this.formError.set('Vui lòng nhập Tên chương trình.');
      return;
    }
    if (this.formDiscountValue() <= 0) {
      this.formError.set('Giá trị giảm phải lớn hơn 0.');
      return;
    }
    if (!this.formStartDate() || !this.formEndDate()) {
      this.formError.set('Vui lòng chọn ngày bắt đầu và kết thúc.');
      return;
    }
    if (new Date(this.formStartDate()) > new Date(this.formEndDate())) {
      this.formError.set('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }

    const payload: CreateUpdateCouponDto = {
      code: code,
      title: title,
      discountType: Number(this.formDiscountType()),
      discountValue: Number(this.formDiscountValue()),
      maxDiscountAmount: this.formMaxDiscountAmount() ? Number(this.formMaxDiscountAmount()) : null,
      minOrderAmount: Number(this.formMinOrderAmount()),
      maxUsageCount: Number(this.formMaxUsageCount()),
      startDate: new Date(this.formStartDate()).toISOString(),
      endDate: new Date(this.formEndDate() + 'T23:59:59').toISOString(),
      isActive: this.formIsActive()
    };

    this.isSubmitting.set(true);
    this.formError.set('');

    try {
      if (this.isEditMode() && this.selectedId()) {
        await firstValueFrom(this.couponService.update(this.selectedId()!, payload));
      } else {
        await firstValueFrom(this.couponService.create(payload));
      }
      this.closeModal();
      await this.loadCoupons();
    } catch (err: any) {
      const msg = err?.error?.error?.message || err?.message || 'Có lỗi xảy ra khi lưu.';
      this.formError.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async toggleActive(c: CouponDto) {
    if (!c.id) return;
    try {
      await firstValueFrom(this.couponService.toggleActive(c.id));
      this.coupons.update(list =>
        list.map(item => item.id === c.id ? { ...item, isActive: !item.isActive } : item)
      );
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái: ' + (err?.error?.error?.message || err?.message));
    }
  }

  async deleteCoupon(c: CouponDto) {
    if (!c.id) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${c.code}" không?`)) {
      return;
    }
    try {
      await firstValueFrom(this.couponService.delete(c.id));
      this.coupons.update(list => list.filter(item => item.id !== c.id));
    } catch (err: any) {
      alert('Không thể xóa: ' + (err?.error?.error?.message || err?.message));
    }
  }
}
