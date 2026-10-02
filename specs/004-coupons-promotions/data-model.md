# Phase 1: Data Model - Coupons & Promotions

**Feature**: Coupons and Promotions Management  
**Spec**: [spec.md](./spec.md)  
**Date**: 2026-09-28  

---

## 1. Enums (`Acme.BookStore.Domain.Shared.Coupons`)

### `DiscountType.cs`
```csharp
namespace Acme.BookStore.Coupons;

public enum DiscountType
{
    Percentage = 1,   // Giảm theo % (VD: 10%, 20%)
    FixedAmount = 2   // Giảm số tiền cố định (VD: 20,000₫, 50,000₫)
}
```

---

## 2. Entities (`Acme.BookStore.Domain.Coupons`)

### `Coupon.cs` (Aggregate Root)
```csharp
using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Coupons;

public class Coupon : FullAuditedAggregateRoot<Guid>
{
    public string Code { get; set; } = string.Empty;               // Mã giảm giá (Unique, In hoa, Trim)
    public string Title { get; set; } = string.Empty;              // Tên chương trình hiển thị
    public DiscountType DiscountType { get; set; }                 // % hoặc Tiền mặt
    public decimal DiscountValue { get; set; }                     // Giá trị giảm (10% hoặc 50.000₫)
    public decimal? MaxDiscountAmount { get; set; }                // Trần giảm tối đa cho loại % (VD: tối đa 100k)
    public decimal MinOrderAmount { get; set; }                    // Giá trị đơn hàng tối thiểu để áp dụng
    public int MaxUsageCount { get; set; }                         // Tổng số lượt dùng tối đa toàn hệ thống
    public int UsedCount { get; set; }                             // Số lượt thực tế đã dùng
    public DateTime StartDate { get; set; }                        // Ngày bắt đầu
    public DateTime EndDate { get; set; }                          // Ngày kết thúc
    public bool IsActive { get; set; } = true;                     // Trạng thái kích hoạt

    protected Coupon() { }

    public Coupon(
        Guid id,
        string code,
        string title,
        DiscountType discountType,
        decimal discountValue,
        decimal? maxDiscountAmount,
        decimal minOrderAmount,
        int maxUsageCount,
        DateTime startDate,
        DateTime endDate,
        bool isActive = true) : base(id)
    {
        Code = code;
        Title = title;
        DiscountType = discountType;
        DiscountValue = discountValue;
        MaxDiscountAmount = maxDiscountAmount;
        MinOrderAmount = minOrderAmount;
        MaxUsageCount = maxUsageCount;
        UsedCount = 0;
        StartDate = startDate;
        EndDate = endDate;
        IsActive = isActive;
    }
}
```

### `CouponUsage.cs` (Audit log lượt sử dụng của từng khách)
```csharp
using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Coupons;

public class CouponUsage : CreationAuditedEntity<Guid>
{
    public Guid CouponId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTime UsedTime { get; set; }

    protected CouponUsage() { }

    public CouponUsage(Guid id, Guid couponId, Guid userId, Guid orderId, decimal discountAmount) : base(id)
    {
        CouponId = couponId;
        UserId = userId;
        OrderId = orderId;
        DiscountAmount = discountAmount;
        UsedTime = DateTime.UtcNow;
    }
}
```

---

## 3. Cập nhật Entity `Order` (`Acme.BookStore.Domain.Order`)

Thêm 2 thuộc tính lưu vết chiết khấu:
- `public string? CouponCode { get; set; }`
- `public decimal DiscountAmount { get; set; } = 0;`

---

## 4. Entity Framework Core Configuration (`BookStoreDbContextModelCreatingExtensions.cs`)

```csharp
builder.Entity<Coupon>(b =>
{
    b.ToTable(BookStoreConsts.DbTablePrefix + "Coupons", BookStoreConsts.DbSchema);
    b.ConfigureByConvention();
    b.Property(x => x.Code).IsRequired().HasMaxLength(50);
    b.HasIndex(x => x.Code).IsUnique();
    b.Property(x => x.Title).IsRequired().HasMaxLength(256);
    b.Property(x => x.DiscountValue).HasPrecision(18, 2);
    b.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
    b.Property(x => x.MinOrderAmount).HasPrecision(18, 2);
});

builder.Entity<CouponUsage>(b =>
{
    b.ToTable(BookStoreConsts.DbTablePrefix + "CouponUsages", BookStoreConsts.DbSchema);
    b.ConfigureByConvention();
    b.HasIndex(x => new { x.CouponId, x.UserId });
});
```
