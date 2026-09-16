using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Carts;

public class CartItemDto : EntityDto<Guid>
{
    public Guid BookId { get; set; }
    public string BookName { get; set; }
    public decimal Price { get; set; }
    public int Count { get; set; }
    public decimal TotalPrice => Price * Count;
}
