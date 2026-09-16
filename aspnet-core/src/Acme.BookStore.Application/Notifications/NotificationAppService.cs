using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace Acme.BookStore.Notifications;

[Authorize]
public class NotificationAppService : ApplicationService, INotificationAppService
{
    private readonly IRepository<AppNotification, Guid> _notificationRepository;

    public NotificationAppService(IRepository<AppNotification, Guid> notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<List<NotificationDto>> GetMyNotificationsAsync()
    {
        var userId = CurrentUser.GetId();
        var queryable = await _notificationRepository.GetQueryableAsync();

        var notifications = queryable
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreationTime)
            .Take(20)
            .ToList();

        return notifications.Select(x => new NotificationDto
        {
            Id = x.Id,
            UserId = x.UserId,
            Title = x.Title,
            Message = x.Message,
            Type = x.Type,
            TargetUrl = x.TargetUrl,
            IsRead = x.IsRead,
            CreationTime = x.CreationTime
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync()
    {
        var userId = CurrentUser.GetId();
        return await _notificationRepository.CountAsync(x => x.UserId == userId && !x.IsRead);
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var notification = await _notificationRepository.FindAsync(id);
        if (notification != null && notification.UserId == CurrentUser.GetId())
        {
            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification, autoSave: true);
        }
    }

    public async Task MarkAllAsReadAsync()
    {
        var userId = CurrentUser.GetId();
        var unreadItems = await _notificationRepository.GetListAsync(x => x.UserId == userId && !x.IsRead);
        foreach (var item in unreadItems)
        {
            item.IsRead = true;
        }
        await _notificationRepository.UpdateManyAsync(unreadItems, autoSave: true);
    }
}
