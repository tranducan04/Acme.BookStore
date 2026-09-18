using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Acme.BookStore.Orders;

public class OrderItem : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid OrderId { get; set; }
    public Guid BookId { get; set; }
    public int Count { get; set; }
    public decimal UnitPrice { get; set; }

    public OrderItem()
    { 

    }
    public OrderItem(Guid id, Guid orderId, Guid bookId, int count, decimal unitPrice)
    {
        Id = id;
        OrderId = orderId;
        BookId = bookId;
        Count = count;
        UnitPrice = unitPrice;
    }
}
