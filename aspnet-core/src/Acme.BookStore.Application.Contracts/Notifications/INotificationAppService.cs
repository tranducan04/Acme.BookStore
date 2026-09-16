using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Notifications;

public interface INotificationAppService : IApplicationService
{
    // Lấy danh sách 20 thông báo gần nhất của người dùng hiện tại
    Task<List<NotificationDto>> GetMyNotificationsAsync();

    // Đếm số lượng thông báo chưa đọc
    Task<int> GetUnreadCountAsync();

    // Đánh dấu 1 thông báo đã đọc
    Task MarkAsReadAsync(Guid id);

    // Đánh dấu tất cả thông báo của người dùng là đã đọc
    Task MarkAllAsReadAsync();
}
