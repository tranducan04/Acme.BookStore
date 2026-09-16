using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Orders;

public class OrderItem : CreationAuditedEntity<Guid>
{
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
