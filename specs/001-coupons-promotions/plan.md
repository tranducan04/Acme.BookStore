# Implementation Plan: Coupons and Promotions Management (Mã Giảm Giá & Khuyến Mãi)

**Branch**: `001-coupons-promotions` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-coupons-promotions/spec.md`

---

## Summary

Xây dựng hệ thống quản lý và áp dụng Mã giảm giá (Coupons & Promotions) hoàn chỉnh cho nền tảng thương mại điện tử Acme.BookStore. 
- **Admin**: Thao tác CRUD mã giảm giá, kiểm soát thời hạn, lượt dùng, loại giảm (% hoặc tiền mặt cố định), trần giảm giá tối đa (`MaxDiscountAmount`) và trạng thái kích hoạt.
- **Storefront User**: Nhập mã giảm giá tại Giỏ hàng / Đặt hàng, kiểm tra tính hợp lệ realtime (hạn dùng, lượt dùng, giá trị đơn hàng tối thiểu, giới hạn 1 lần / mỗi khách), tự động trừ tiền chiết khấu và reactive sinh lại mã VietQR tương ứng với số tiền thực thu.
- **Hoàn lượt**: Tự động giải phóng bản ghi sử dụng và hoàn lại lượt dùng khi đơn hàng bị Hủy.

---

## Technical Context

**Language/Version**: C# 12 / .NET 10 (Backend) & TypeScript 5+ / Angular 17+ (Frontend)  
**Primary Dependencies**: ABP Framework 9+, Entity Framework Core 9+, Angular Signals, RxJS  
**Storage**: Microsoft SQL Server (qua EF Core Code-First Migrations)  
**Target Platform**: Web Responsive (Desktop, Tablet, Mobile)  
**Project Type**: Clean Architecture Web E-Commerce Application  
**Performance Goals**: API ValidateCoupon phản hồi < 300ms, UI update ngay lập tức qua Signal State  
**Constraints**: 
- Tiếng Việt 100% trong toàn bộ thông báo nghiệp vụ và nhãn UI.
- Đơn vị tiền tệ chuẩn VNĐ (`₫`).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc Hiến pháp | Trạng thái | Đánh giá tuân thủ |
| :--- | :---: | :--- |
| **I. Direct `IApplicationService`** | ✅ PASS | `ICouponAppService : IApplicationService` tuyệt đối không dùng `ICrudAppService<...>`. Khai báo tường minh 7 phương thức nghiệp vụ. |
| **II. Angular Signals & One-Way Binding** | ✅ PASS | Sử dụng `signal()`, `computed()` để quản lý danh sách coupon, modal, form input và cập nhật giỏ hàng/VietQR reactive một chiều. Không dùng `[(ngModel)]` bừa bãi hay Bootstrap JS. |
| **III. Modern Angular Standards** | ✅ PASS | `standalone: true`, `inject()`, modern control flow `@if`, `@for`, async handling với `firstValueFrom()`. |
| **IV. Clean Architecture (ABP)** | ✅ PASS | Phân tách nghiêm ngặt: Domain.Shared -> Domain -> Application.Contracts -> Application -> EntityFrameworkCore -> Angular proxy. |
| **V. Localization & VNĐ Currency** | ✅ PASS | Chuỗi thông báo lỗi tiếng Việt đầy đủ, hiển thị đơn vị `₫` chuẩn. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-coupons-promotions/
├── spec.md                  # Tài liệu đặc tả yêu cầu nghiệp vụ
├── checklists/
│   └── requirements.md      # Checklist chất lượng spec
├── plan.md                  # Kế hoạch kỹ thuật tổng thể (file này)
├── research.md              # Phase 0: Phân tích kỹ thuật & thuật toán validate
├── data-model.md            # Phase 1: Thiết kế Entity, Enum, DbContext
├── quickstart.md            # Phase 1: Kịch bản kiểm thử nhanh
├── contracts/
│   └── ICouponAppService.cs # Phase 1: Contract Interface & DTOs
└── tasks.md                 # Phase 2: Danh sách checklist công việc (/speckit.tasks)
```

### Source Code Changes

```text
aspnet-core/src/
├── Acme.BookStore.Domain.Shared/
│   └── Coupons/
│       └── DiscountType.cs                              # Enum: Percentage, FixedAmount
├── Acme.BookStore.Domain/
│   ├── Coupons/
│   │   ├── Coupon.cs                                    # Aggregate Root
│   │   └── CouponUsage.cs                               # Audit log sử dụng theo từng User
│   └── Order/
│       └── Order.cs                                     # Bổ sung CouponCode, DiscountAmount
├── Acme.BookStore.Application.Contracts/
│   ├── Coupons/
│   │   ├── ICouponAppService.cs                         # Kế thừa IApplicationService
│   │   └── CouponDtos.cs                                # Input/Output DTOs
│   └── Permissions/
│       └── BookStorePermissions.cs                      # Thêm quyền BookStorePermissions.Coupons
├── Acme.BookStore.Application/
│   ├── Coupons/
│   │   └── CouponAppService.cs                          # ApplicationService thực thi logic
│   └── Order/
│       └── OrderAppService.cs                           # Ghi nhận lượt dùng & Hoàn lượt khi hủy
└── Acme.BookStore.EntityFrameworkCore/
    └── EntityFrameworkCore/
        ├── BookStoreDbContext.cs                        # Thêm DbSet<Coupon>, DbSet<CouponUsage>
        └── Migrations/                                  # Migration Add_Coupons_And_Promotions

angular/src/app/
├── proxy/coupons/                                       # Sinh tự động qua ABP CLI
├── features/
│   ├── admin/
│   │   └── Coupons/
│   │       ├── coupon.component.ts                      # Standalone, Angular Signals
│   │       ├── coupon.component.html                    # Modern @if, @for, One-way binding
│   │       └── coupon.component.scss
│   └── user/
│       └── Carts/                                       # Tích hợp ô nhập mã coupon & tính lại VietQR
└── app.routes.ts                                        # Thêm route '/admin/coupons'
```

---

## Complexity Tracking

Không có vi phạm hay ngoại lệ nào so với Hiến pháp. Thiết kế hoàn toàn ăn khớp và sạch sẽ.
