using System;
using Acme.BookStore.Notifications;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Notifications;

public class AppNotification : CreationAuditedEntity<Guid>
{
    public Guid UserId { get; set; }           // Người nhận thông báo
    public string Title { get; set; } = string.Empty;   // Tiêu đề ngắn gọn
    public string Message { get; set; } = string.Empty; // Nội dung chi tiết
    public NotificationType Type { get; set; } // Loại thông báo
    public string? TargetUrl { get; set; }      // Đường dẫn khi bấm vào (VD: /orders)
    public bool IsRead { get; set; }           // Trạng thái đã đọc hay chưa

    public AppNotification()
    {
    }

    public AppNotification(
        Guid id,
        Guid userId,
        string title,
        string message,
        NotificationType type = NotificationType.System,
        string? targetUrl = null) : base(id)
    {
        UserId = userId;
        Title = title;
        Message = message;
        Type = type;
        TargetUrl = targetUrl;
        IsRead = false;
    }
}
