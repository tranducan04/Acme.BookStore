using System;
using Acme.BookStore.Books;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Wishlists;

public class WishlistItemDto : EntityDto<Guid>
{
    public Guid BookId { get; set; }
    public string BookName { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public float Price { get; set; }
    public float? OriginalPrice { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int StockCount { get; set; }
    public BookType Type { get; set; }
    public DateTime CreationTime { get; set; }
}
