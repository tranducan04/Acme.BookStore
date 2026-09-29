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
