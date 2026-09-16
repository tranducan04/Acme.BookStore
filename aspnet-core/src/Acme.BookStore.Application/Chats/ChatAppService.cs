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
        
        var allMessages = await _chatRepository.GetListAsync(
            x => (x.SenderId == currentUserId && (x.ReceiverId == otherUserId || x.ReceiverId == Guid.Empty)) ||
                 ((x.SenderId == otherUserId || x.SenderId == Guid.Empty) && x.ReceiverId == currentUserId)
        );

        var messages = allMessages
            .OrderBy(x => x.CreationTime)
            .Take(100)
            .ToList();

        return messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            SenderId = m.SenderId,
            ReceiverId = m.ReceiverId,
            SenderName = m.SenderName,
            Message = m.Message,
            IsRead = m.IsRead,
            IsMyMessage = m.SenderId == currentUserId, // Đánh dấu true nếu chính mình gửi
            CreationTime = m.CreationTime
        }).ToList();
    }

    /// <summary>
    /// 2. API DÀNH CHO ADMIN: Lấy danh sách tất cả Khách hàng đang nhắn tin
    /// </summary>
    public async Task<List<ConversationDto>> GetAdminConversationListAsync()
    {
        var currentUserId = CurrentUser.GetId();
        var allMessages = await _chatRepository.GetListAsync();

        // Gom nhóm tin nhắn theo ID khách hàng (người không phải là Admin)
        var grouped = allMessages
            .Select(m => new { Message = m, CustomerId = m.SenderId == currentUserId ? m.ReceiverId : m.SenderId })
            .Where(x => x.CustomerId != currentUserId)
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
}
