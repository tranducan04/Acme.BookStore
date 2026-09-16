using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Orders;

public class CreateOrderDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên người nhận")]
    [StringLength(64)]
    public string ReceiverName { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại người nhận")]
    [StringLength(16)]
    public string ReceiverPhone { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn địa chỉ giao hàng")]
    [StringLength(256)]
    public string ShippingAddress { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn phương thức thanh toán")]
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;
}
