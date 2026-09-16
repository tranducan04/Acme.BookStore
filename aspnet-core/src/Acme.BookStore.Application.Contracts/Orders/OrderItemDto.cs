using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Orders;

public class OrderItemDto : EntityDto<Guid>
{
    public Guid BookId { get; set; }
    public string BookName { get; set; }
    public string? CoverImage { get; set; }
    public int Count { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => UnitPrice * Count;
}
