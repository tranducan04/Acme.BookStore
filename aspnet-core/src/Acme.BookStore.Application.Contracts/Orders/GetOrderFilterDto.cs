using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Orders;

public class GetOrderFilterDto : PagedAndSortedResultRequestDto
{
    /// <summary>
    /// Tìm kiếm theo mã đơn hàng, tên người nhận, SĐT
    /// </summary>
    public string? Keyword { get; set; }

    /// <summary>
    /// Lọc theo trạng thái đơn hàng
    /// </summary>
    public OrderStatus? Status { get; set; }

    /// <summary>
    /// Lọc theo phương thức thanh toán
    /// </summary>
    public PaymentMethod? PaymentMethod { get; set; }
}
