using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace Acme.BookStore.Chats;

[Authorize]
public class ChatAppService : ApplicationService, IChatAppService
{
    private readonly IRepository<ChatMessage, Guid> _chatRepository;
    private readonly IIdentityUserRepository _userRepository;

    public ChatAppService(
        IRepository<ChatMessage, Guid> chatRepository,
        IIdentityUserRepository userRepository)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
    }

    /// <summary>
    /// 1. Lấy lịch sử nhắn tin 2 chiều giữa 2 người dùng (Sắp xếp theo thời gian tăng dần)
    /// </summary>
    public async Task<List<ChatMessageDto>> GetMyChatHistoryAsync(Guid otherUserId)
    {
        var currentUserId = CurrentUser.GetId();
        var isAdmin = CurrentUser.IsInRole("admin") || CurrentUser.UserName == "admin";

        var queryable = await _chatRepository.GetQueryableAsync();

        IQueryable<ChatMessage> query;
        if (isAdmin)
        {
            query = queryable
                .Where(x => x.SenderId == otherUserId || x.ReceiverId == otherUserId)
                .OrderBy(x => x.CreationTime)
                .Take(100);
        }
        else
        {
            query = queryable
                .Where(x => (x.SenderId == currentUserId && x.ReceiverId == otherUserId) ||
                            (x.SenderId == otherUserId && x.ReceiverId == currentUserId))
                .OrderBy(x => x.CreationTime)
                .Take(100);
        }

        var messages = await AsyncExecuter.ToListAsync(query);

        return messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            SenderId = m.SenderId,
            ReceiverId = m.ReceiverId,
            SenderName = m.SenderName,
            Message = m.Message,
            IsRead = m.IsRead,
            IsMyMessage = isAdmin ? (m.SenderId != otherUserId) : (m.SenderId == currentUserId),
            CreationTime = m.CreationTime
        }).ToList();
    }

    /// <summary>
    /// 2. API DÀNH CHO ADMIN: Lấy danh sách tất cả Khách hàng đang nhắn tin
    /// </summary>
    public async Task<List<ConversationDto>> GetAdminConversationListAsync()
    {
        var currentUserId = CurrentUser.Id ?? Guid.Empty;

        // Lấy tất cả tin nhắn trong bảng ChatMessages
        var allMessages = await _chatRepository.GetListAsync();

        // Danh sách ID của các admin (không phân biệt hoa thường)
        var adminUsers = await _userRepository.GetListAsync();
        var adminIds = adminUsers
            .Where(u => string.Equals(u.UserName, "admin", StringComparison.OrdinalIgnoreCase))
            .Select(u => u.Id)
            .ToHashSet();

        using (CurrentTenant.Change(null))
        {
            var hostUsers = await _userRepository.GetListAsync();
            foreach (var hu in hostUsers.Where(u => string.Equals(u.UserName, "admin", StringComparison.OrdinalIgnoreCase)))
            {
                adminIds.Add(hu.Id);
            }
        }

        if (currentUserId != Guid.Empty)
        {
            adminIds.Add(currentUserId);
        }

        // Gom nhóm tin nhắn theo ID khách hàng (người không phải là Admin)
        var grouped = allMessages
            .Where(m => !adminIds.Contains(m.SenderId) || !adminIds.Contains(m.ReceiverId))
            .Select(m => new
            {
                Message = m,
                CustomerId = adminIds.Contains(m.SenderId) ? m.ReceiverId : m.SenderId
            })
            .Where(x => x.CustomerId != Guid.Empty && !adminIds.Contains(x.CustomerId))
            .GroupBy(x => x.CustomerId)
            .ToList();

        var result = new List<ConversationDto>();

        foreach (var group in grouped)
        {
            var customerId = group.Key;
            string customerName = "Khách hàng";

            if (customerId != Guid.Empty)
            {
                var user = await _userRepository.FindAsync(customerId);
                customerName = user?.UserName ?? user?.Name ?? "Khách hàng";
            }

            var lastMsg = group.OrderByDescending(x => x.Message.CreationTime).First().Message;
            if (customerName == "Khách hàng" && !string.IsNullOrEmpty(lastMsg.SenderName))
            {
                customerName = lastMsg.SenderName;
            }

            var unreadCount = group.Count(x => x.Message.SenderId == customerId && !x.Message.IsRead);

            result.Add(new ConversationDto
            {
                Id = customerId,
                UserId = customerId,
                UserName = customerName,
                LastMessage = lastMsg.Message,
                LastMessageTime = lastMsg.CreationTime,
                UnreadCount = unreadCount
            });
        }

        return result.OrderByDescending(x => x.LastMessageTime).ToList();
    }

    /// <summary>
    /// 3. Đánh dấu đã đọc các tin nhắn từ 1 Khách hàng
    /// </summary>
    public async Task MarkAsReadAsync(Guid senderId)
    {
        var currentUserId = CurrentUser.GetId();
        var unreadMessages = await _chatRepository.GetListAsync(x => x.SenderId == senderId && x.ReceiverId == currentUserId && !x.IsRead);

        foreach (var msg in unreadMessages)
        {
            msg.IsRead = true;
        }

        await _chatRepository.UpdateManyAsync(unreadMessages, autoSave: true);
    }

    /// <summary>
    /// 4. Lấy ID của Admin (user có role "admin") để client gửi tin nhắn đúng người
    /// </summary>
    [AllowAnonymous]
    public async Task<Guid> GetAdminIdAsync()
    {
        // 1. Tìm trong context hiện tại bằng NormalizedUserName
        var admin = await _userRepository.FindByNormalizedUserNameAsync("ADMIN");
        if (admin != null)
        {
            return admin.Id;
        }

        var users = await _userRepository.GetListAsync();
        admin = users.FirstOrDefault(u => string.Equals(u.UserName, "admin", StringComparison.OrdinalIgnoreCase));
        if (admin != null)
        {
            return admin.Id;
        }

        // 2. Tìm ở Host tenant (bỏ qua Tenant filter)
        using (CurrentTenant.Change(null))
        {
            var hostAdmin = await _userRepository.FindByNormalizedUserNameAsync("ADMIN");
            if (hostAdmin != null)
            {
                return hostAdmin.Id;
            }

            var hostUsers = await _userRepository.GetListAsync();
            hostAdmin = hostUsers.FirstOrDefault(u => string.Equals(u.UserName, "admin", StringComparison.OrdinalIgnoreCase));
            if (hostAdmin != null)
            {
                return hostAdmin.Id;
            }
        }

        // 3. Fallback: Lấy user đầu tiên nếu không tìm ra admin cụ thể
        return users.FirstOrDefault()?.Id ?? Guid.Empty;
    }
}
