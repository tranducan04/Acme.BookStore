using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Orders;

public class OrderDto : AuditedEntityDto<Guid>
{
    public Guid UserId { get; set; }
    public string OrderNo { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }

    public string ReceiverName { get; set; }
    public string ReceiverPhone { get; set; }
    public string ShippingAddress { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }

    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}
