using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Carts;

public class Cart : FullAuditedAggregateRoot<Guid>
{
    public Guid UserId { get; set; }
    public ICollection<CartItem> Items { get; set; }

    public Cart()
    {
        Items = new List<CartItem>();
    }

    public Cart(Guid id, Guid userId)
    {
        Id = id;
        UserId = userId;
        Items = new List<CartItem>();
    }
}
