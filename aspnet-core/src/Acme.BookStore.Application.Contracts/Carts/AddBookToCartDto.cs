using System;
using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Carts;

public class AddBookToCartDto
{
    [Required]
    public Guid BookId { get; set; }

    [Range(1, int.MaxValue)]
    public int Count { get; set; } = 1;
}
