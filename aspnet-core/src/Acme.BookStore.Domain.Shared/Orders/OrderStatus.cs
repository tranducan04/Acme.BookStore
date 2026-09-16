namespace Acme.BookStore.Orders;

public enum OrderStatus
{
    Placed = 0,      // Đã đặt hàng
    Processing = 1,  // Đang xử lý
    Shipped = 2,     // Đang giao hàng
    Completed = 3,   // Đã hoàn thành
    Cancelled = 4    // Đã hủy
}
