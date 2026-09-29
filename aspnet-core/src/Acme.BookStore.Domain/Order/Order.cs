using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Acme.BookStore.Orders;

public class Order : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; } 
    public Guid UserId { get; set; }
    public string OrderNo { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    
    // Thông tin người nhận
    public string ReceiverName { get; set; }
    public string ReceiverPhone { get; set; }
    public string ShippingAddress { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    // Thông tin mã giảm giá áp dụng
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; } = 0;

    public ICollection<OrderItem> Items { get; set; }

    public Order()
    {
        Items = new List<OrderItem>();
    }

    public Order(
        Guid id,
        Guid userId,
        string orderNo,
        string receiverName,
        string receiverPhone,
        string shippingAddress,
        PaymentMethod paymentMethod = PaymentMethod.COD)
    {
        Id = id;
        UserId = userId;
        OrderNo = orderNo;
        ReceiverName = receiverName;
        ReceiverPhone = receiverPhone;
        ShippingAddress = shippingAddress;
        PaymentMethod = paymentMethod;
        PaymentStatus = paymentMethod == PaymentMethod.COD ? PaymentStatus.Unpaid : PaymentStatus.Paid;
        Status = OrderStatus.Placed;
        Items = new List<OrderItem>();
    }
}
