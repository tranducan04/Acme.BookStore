# Phase 0: Research & Technical Feasibility - Coupons & Promotions

**Feature**: Coupons and Promotions Management (Mã Giảm Giá & Khuyến Mãi)  
**Spec**: [spec.md](./spec.md)  
**Date**: 2026-09-28  

---

## 1. Kiến trúc Backend: ABP Framework 9+ (.NET 10)

### 1.1 Quyết định kế thừa Service
- **Tuân thủ Hiến pháp**: Không dùng `ICrudAppService<...>`.
- **Interface**: `ICouponAppService : IApplicationService` trong `Acme.BookStore.Application.Contracts.Coupons`.
- **Triển khai**: `CouponAppService : ApplicationService, ICouponAppService` trong `Acme.BookStore.Application.Coupons`.
  - Tự inject `IRepository<Coupon, Guid>` và `IRepository<CouponUsage, Guid>` cùng `ICurrentUser`.
  - Kiểm soát hoàn toàn logic xác thực (Validation), tính toán giảm giá và giao tác (Transaction).

### 1.2 Thuật toán Validate & Tính tiền giảm giá
```csharp
public async Task<CouponValidationResultDto> ValidateCouponAsync(ValidateCouponInputDto input)
{
    // 1. Chuẩn hóa mã: Trim & ToUpper
    var code = input.Code?.Trim().ToUpperInvariant();
    if (string.IsNullOrWhiteSpace(code))
        return CouponValidationResultDto.Fail("Vui lòng nhập mã giảm giá.");

    // 2. Tìm mã trong CSDL
    var coupon = await _couponRepository.FirstOrDefaultAsync(x => x.Code == code);
    if (coupon == null)
        return CouponValidationResultDto.Fail("Mã giảm giá không tồn tại.");

    // 3. Kiểm tra trạng thái kích hoạt
    if (!coupon.IsActive)
        return CouponValidationResultDto.Fail("Mã giảm giá hiện đang tạm khóa.");

    // 4. Kiểm tra thời hạn
    var now = Clock.Now;
    if (now < coupon.StartDate || now > coupon.EndDate)
        return CouponValidationResultDto.Fail("Mã giảm giá chưa tới đợt hoặc đã hết hạn sử dụng.");

    // 5. Kiểm tra tổng lượt dùng hệ thống
    if (coupon.UsedCount >= coupon.MaxUsageCount)
        return CouponValidationResultDto.Fail("Mã giảm giá đã hết lượt sử dụng.");

    // 6. Kiểm tra giá trị đơn hàng tối thiểu
    if (input.OrderTotal < coupon.MinOrderAmount)
        return CouponValidationResultDto.Fail($"Đơn hàng tối thiểu phải đạt {coupon.MinOrderAmount:N0}₫ để dùng mã này.");

    // 7. Kiểm tra giới hạn 1 lần / mỗi khách hàng (Per-User Limit)
    if (CurrentUser.IsAuthenticated && CurrentUser.Id.HasValue)
    {
        var alreadyUsed = await _usageRepository.AnyAsync(x => x.CouponId == coupon.Id && x.UserId == CurrentUser.Id.Value);
        if (alreadyUsed)
            return CouponValidationResultDto.Fail("Bạn đã sử dụng mã giảm giá này rồi (mỗi tài khoản chỉ được dùng 1 lần).");
    }

    // 8. Tính số tiền giảm
    decimal discount = 0;
    if (coupon.DiscountType == DiscountType.Percentage)
    {
        discount = Math.Round(input.OrderTotal * (coupon.DiscountValue / 100m));
        if (coupon.MaxDiscountAmount.HasValue && coupon.MaxDiscountAmount.Value > 0)
        {
            discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
        }
    }
    else // FixedAmount
    {
        discount = coupon.DiscountValue;
    }

    // Không để giảm vượt quá tổng tiền
    discount = Math.Min(discount, input.OrderTotal);
    var finalTotal = Math.Max(0, input.OrderTotal - discount);

    return CouponValidationResultDto.Success(coupon.Id, coupon.Code, coupon.Title, discount, finalTotal);
}
```

---

## 2. Kiến trúc Frontend: Angular 17+ Signals & One-Way Binding

### 2.1 State Management bằng Signals
- Trong [Admin Coupon Component]:
  - `coupons = signal<CouponDto[]>([])`
  - `isLoading = signal<boolean>(false)`
  - `isModalOpen = signal<boolean>(false)`
  - `isEditMode = signal<boolean>(false)`
  - `searchTerm = signal<string>('')`
  - `filteredCoupons = computed(() => ...)`
- Trong [User Cart / Checkout Component]:
  - `couponCodeInput = signal<string>('')`
  - `appliedCoupon = signal<CouponValidationResultDto | null>(null)`
  - `isApplyingCoupon = signal<boolean>(false)`
  - `couponError = signal<string>('')`
  - `cartSubtotal = computed(() => ...)`
  - `discountAmount = computed(() => this.appliedCoupon()?.discountAmount || 0)`
  - `cartTotal = computed(() => Math.max(0, this.cartSubtotal() - this.discountAmount()))`
  - `vietQrUrl = computed(() => sinh_ma_qr_theo(this.cartTotal()))` -> Phản ứng reactive ngay khi áp dụng coupon!

---

## 3. Hoàn lượt khi Đơn hàng bị Hủy (Cancellation Hook)

- Khi `OrderAppService.CancelOrderAsync(Guid orderId)` hoặc Admin đổi trạng thái sang `OrderStatus.Cancelled`:
  - Kiểm tra xem đơn hàng có `CouponCode` hoặc `CouponUsage` liên quan không.
  - Nếu có: Xóa bản ghi `CouponUsage` tương ứng và giảm `UsedCount` của Coupon xuống 1.
  - Khách hàng có thể sử dụng lại mã này ngay lập tức.
