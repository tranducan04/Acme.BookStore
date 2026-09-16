using System;
using Acme.BookStore.Notifications;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Notifications;

public class NotificationDto : EntityDto<Guid>
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string? TargetUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreationTime { get; set; }
}
