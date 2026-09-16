using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Acme.BookStore.Chats;
using Microsoft.AspNetCore.SignalR;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace Acme.BookStore.Hubs;

public class ChatHub : Hub
{
    private readonly IRepository<ChatMessage, Guid> _chatRepository;
    private readonly ICurrentUser _currentUser;

    public ChatHub(
        IRepository<ChatMessage, Guid> chatRepository,
        ICurrentUser currentUser)
    {
        _chatRepository = chatRepository;
        _currentUser = currentUser;
    }

    public async Task SendMessageAsync(Guid receiverId, string message)
    {
        var senderId = _currentUser.Id ?? Guid.Empty;

        if (senderId == Guid.Empty && Context.User != null)
        {
            var subClaim = Context.User.FindFirst("sub")?.Value
                        ?? Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? Context.UserIdentifier;

            if (Guid.TryParse(subClaim, out var parsedId))
            {
                senderId = parsedId;
            }
        }

        var senderName = _currentUser.UserName
            ?? _currentUser.Name
            ?? Context.User?.FindFirst("name")?.Value
            ?? Context.User?.FindFirst("preferred_username")?.Value
            ?? Context.User?.FindFirst(ClaimTypes.Name)?.Value
            ?? "Khách hàng";

        // 1. Lưu tin nhắn vào Database
        var chatMsg = new ChatMessage(Guid.NewGuid(), senderId, receiverId, senderName, message);
        await _chatRepository.InsertAsync(chatMsg, autoSave: true);

        // 2. Bắn Real-time qua SignalR tới tất cả người dùng (0.01s)
        await Clients.All.SendAsync("ReceiveMessage", new
        {
            id = chatMsg.Id,
            senderId = senderId,
            senderName = senderName,
            receiverId = receiverId,
            message = message,
            creationTime = chatMsg.CreationTime
        });
    }
}
