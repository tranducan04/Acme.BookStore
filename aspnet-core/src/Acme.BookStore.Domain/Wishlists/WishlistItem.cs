using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Wishlists;

public class WishlistItem : CreationAuditedEntity<Guid>
{
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }

    public WishlistItem()
    {
    }

    public WishlistItem(Guid id, Guid userId, Guid bookId) : base(id)
    {
        UserId = userId;
        BookId = bookId;
    }
}
