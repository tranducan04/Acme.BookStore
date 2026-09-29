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
