# Tasks: Coupons and Promotions Management (Mã Giảm Giá & Khuyến Mãi)

**Input**: Design documents from `specs/001-coupons-promotions/` (`plan.md`, `spec.md`, `data-model.md`, `contracts/ICouponAppService.cs`)  
**Constitution**: Tuân thủ trực tiếp `IApplicationService` và `Angular Signals & One-Way Binding`  
**Status**: In Progress (`/speckit.implement` - Core Implementation Complete)  

---

## 📋 Danh sách Task triển khai theo từng giai đoạn

### 🔷 Giai đoạn 1: Nền tảng Dữ liệu (Backend Domain & EF Core)
*Mục đích: Thiết lập Schema CSDL, Entity và Migration*

- [x] **T001** [P] Tạo Enum `DiscountType` (`Percentage = 1`, `FixedAmount = 2`) tại `aspnet-core/src/Acme.BookStore.Domain.Shared/Coupons/DiscountType.cs`.
- [x] **T002** [P] Tạo Aggregate Root `Coupon` (Code, Title, DiscountType, DiscountValue, MaxDiscountAmount, MinOrderAmount, MaxUsageCount, UsedCount, StartDate, EndDate, IsActive) tại `aspnet-core/src/Acme.BookStore.Domain/Coupons/Coupon.cs`.
- [x] **T003** [P] Tạo Entity `CouponUsage` (CouponId, UserId, OrderId, DiscountAmount, UsedTime) tại `aspnet-core/src/Acme.BookStore.Domain/Coupons/CouponUsage.cs`.
- [x] **T004** Cập nhật Entity `Order` bổ sung 2 trường `CouponCode` và `DiscountAmount` tại `aspnet-core/src/Acme.BookStore.Domain/Order/Order.cs`.
- [x] **T005** Cấu hình `BookStoreDbContext.cs` và Fluent API (Index Unique cho `Code`, HasPrecision(18,2)) trong `aspnet-core/src/Acme.BookStore.EntityFrameworkCore/EntityFrameworkCore/BookStoreDbContext.cs`.
- [x] **T006** Tạo và chạy Migration EF Core (`20260928074702_Added_Coupons_And_Promotions`) cập nhật bảng `AppCoupons` và `AppCouponUsages` vào CSDL SQL Server.

---

### 🔷 Giai đoạn 2: Hợp đồng Dịch vụ & Phân quyền (Application.Contracts)
*Mục đích: Định nghĩa API Contract chuẩn IApplicationService và Permissions*

- [x] **T007** [P] Thêm hằng số phân quyền `BookStorePermissions.Coupons` (Default, Create, Edit, Delete) và chuỗi bản địa hóa Tiếng Việt vào `vi.json`.
- [x] **T008** [P] Tạo các DTOs (`CouponDto`, `CreateUpdateCouponDto`, `GetCouponListDto`, `ValidateCouponInputDto`, `CouponValidationResultDto`) tại `aspnet-core/src/Acme.BookStore.Application.Contracts/Coupons/CouponDtos.cs`.
- [x] **T009** Tạo Interface `ICouponAppService : IApplicationService` tại `aspnet-core/src/Acme.BookStore.Application.Contracts/Coupons/ICouponAppService.cs` (*Tuyệt đối không kế thừa ICrudAppService*).

---

### 🔷 Giai đoạn 3: Nghiệp vụ Backend (Application Services)
*Mục đích: Viết logic xử lý tính hợp lệ, tính tiền chiết khấu và hoàn lượt*

- [x] **T010** Triển khai `CouponAppService : ApplicationService, ICouponAppService` tại `aspnet-core/src/Acme.BookStore.Application/Coupons/CouponAppService.cs`:
  - CRUD mã giảm giá (GetAsync, GetListAsync, CreateAsync, UpdateAsync, DeleteAsync, ToggleActiveAsync).
  - Thuật toán `ValidateCouponAsync`: Chuẩn hóa in hoa/trim, kiểm tra hạn, kiểm tra lượt, kiểm tra giá trị đơn tối thiểu, tính trần giảm giá %, và kiểm tra per-user limit.
- [x] **T011** [P] Đăng ký AutoMapper / Object Mapping cho `Coupon` <-> `CouponDto` trong `BookStoreApplicationMappers.cs`.
- [x] **T012** Cập nhật `OrderAppService.cs`:
  - Ghi nhận `CouponUsage` và tăng `UsedCount` khi khách hàng đặt đơn hàng thành công có áp mã.
  - Tự động hoàn lại lượt dùng (giảm `UsedCount` và xóa bản ghi `CouponUsage`) khi đơn hàng chuyển trạng thái `Cancelled`.

---

### 🔷 Giai đoạn 4: Sinh Proxy & Giao diện Quản trị Admin (Angular Signals)
*Mục đích: Trang Admin quản lý mã khuyến mãi với Signals & One-Way Binding*

- [x] **T013** Chạy lệnh sinh proxy ABP: tạo TypeScript client trong `angular/src/app/proxy/coupons/` (models.ts, coupon.service.ts, index.ts).
- [x] **T014** Tạo Component Standalone `CouponComponent` tại `angular/src/app/features/admin/Coupons/coupon.component.ts`:
  - Quản lý state bằng Angular Signals: `coupons = signal([])`, `isLoading = signal(false)`, `isModalOpen = signal(false)`, `isEditMode = signal(false)`.
  - Trạng thái lọc tìm kiếm `filteredCoupons = computed(...)`.
  - Sử dụng `inject(CouponService)` và `firstValueFrom()`.
- [x] **T015** Thiết kế template `coupon.component.html` & `.scss`:
  - Luồng 1 chiều One-Way Binding `[value]` / `(input)` hoặc signal setter.
  - Cú pháp Angular mới `@if`, `@for (item of filteredCoupons(); track item.id)`.
  - Modal tạo/sửa điều khiển 100% bằng Signal State (không dùng Bootstrap JS).
- [x] **T016** Đăng ký routing `/admin/coupons` trong `angular/src/app/app.routes.ts` và gắn link trên Sidebar Navigation của Admin (`route.provider.ts`).

---

### 🔷 Giai đoạn 5: Tích hợp Khách hàng & Thanh toán VietQR (Storefront Signals)
*Mục đích: Khách hàng nhập mã ở Giỏ hàng / Đặt hàng, cập nhật VietQR tự động*

- [x] **T017** Thêm ô nhập mã Coupon và nút "Áp dụng" / "Hủy mã" vào `angular/src/app/features/user/Carts/cart.component.ts` & `.html`.
- [x] **T018** Quản lý trạng thái bằng Signals:
  - `appliedCoupon = signal<CouponValidationResultDto | null>(null)`
  - `discountAmount = computed(() => this.appliedCoupon()?.discountAmount || 0)`
  - `finalTotal = computed(() => Math.max(0, this.cartTotal() - this.discountAmount()))`
  - Tự động sinh lại URL mã **VietQR** động theo số tiền `finalTotal()`.
- [x] **T019** Gửi `couponCode` kèm theo payload khi gọi API tạo đơn hàng `CreateOrderAsync`.

---

### 🔷 Giai đoạn 6: Kiểm thử E2E & Hoàn thiện
*Mục đích: Xác thực hoạt động toàn chu trình theo quickstart.md*

- [ ] **T020** Chạy kiểm thử luồng Admin: Tạo mã giảm giá 15% tối đa 50k, test bật/tắt kích hoạt.
- [ ] **T021** Chạy kiểm thử luồng User: Nhập mã, kiểm tra tiền giảm chính xác, kiểm tra VietQR đúng số tiền, đặt hàng thành công, thử dùng lại mã để xác nhận chặn per-user limit, và test hủy đơn hoàn lượt.
