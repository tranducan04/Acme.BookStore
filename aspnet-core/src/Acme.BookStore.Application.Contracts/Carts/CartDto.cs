using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Carts;

public class CartDto : EntityDto<Guid>
{
    public Guid UserId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalPrice => Items.Sum(x => x.TotalPrice);
    public int TotalCount => Items.Sum(x => x.Count);
}
