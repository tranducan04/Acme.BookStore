using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Books;

public class Book : AuditedAggregateRoot<Guid>
{
    public Guid? PublisherId { get; set; }
    public Guid? AuthorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public BookType Type { get; set; }
    public DateTime PublishDate { get; set; }
    public float Price { get; set; }
    public float? OriginalPrice { get; set; }
    public int StockCount { get; set; } = 100;
    public string? CoverImage { get; set; }
    public Guid? CategoryId { get; set; }
    public int AgeLimit { get; set; } 
}