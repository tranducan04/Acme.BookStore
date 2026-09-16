namespace Acme.BookStore.Notifications;

public enum NotificationType
{
    Order = 0,       // Thông báo về Đơn hàng (Đặt hàng, Hủy đơn)
    Shipping = 1,    // Thông báo về Vận chuyển (Đang giao, Giao thành công)
    Review = 2,      // Thông báo về Đánh giá sách mới
    System = 3       // Thông báo từ hệ thống
}
