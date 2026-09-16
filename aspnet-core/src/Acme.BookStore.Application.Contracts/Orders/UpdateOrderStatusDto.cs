using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Orders;

public class UpdateOrderStatusDto
{
    [Required]
    public OrderStatus Status { get; set; }
}
