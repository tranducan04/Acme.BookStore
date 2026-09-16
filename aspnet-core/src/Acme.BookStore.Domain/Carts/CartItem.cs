using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Carts;

public class CartItem : CreationAuditedEntity<Guid>
{
    public Guid CartId { get; set; }
    public Guid BookId { get; set; }
    public int Count { get; set; }

    public CartItem()
    {
    }

    public CartItem(Guid id, Guid cartId, Guid bookId, int count)
    {
        Id = id;
        CartId = cartId;
        BookId = bookId;
        Count = count;
    }
}
