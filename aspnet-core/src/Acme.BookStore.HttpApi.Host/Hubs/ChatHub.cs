using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Acme.BookStore.Chats;
using Microsoft.AspNetCore.SignalR;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Security.Claims;
using Volo.Abp.Uow;
using Volo.Abp.Users;

namespace Acme.BookStore.Hubs;

public class ChatHub : Hub
{
    private readonly IRepository<ChatMessage, Guid> _chatRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IUnitOfWorkManager _unitOfWorkManager;

    public ChatHub(
        IRepository<ChatMessage, Guid> chatRepository,
        ICurrentUser currentUser,
        IUnitOfWorkManager unitOfWorkManager)
    {
        _chatRepository = chatRepository;
        _currentUser = currentUser;
        _unitOfWorkManager = unitOfWorkManager;
    }

    public override async Task OnConnectedAsync()
    {
        var isAdmin = _currentUser.IsInRole("admin")
            || string.Equals(_currentUser.UserName, "admin", StringComparison.OrdinalIgnoreCase)
            || Context.User?.IsInRole("admin") == true
            || string.Equals(Context.User?.FindFirst("preferred_username")?.Value, "admin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(Context.User?.FindFirst(ClaimTypes.Name)?.Value, "admin", StringComparison.OrdinalIgnoreCase);

        if (isAdmin)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        await base.OnConnectedAsync();
    }

    public async Task SendMessageAsync(Guid receiverId, string message)
    {
        var senderId = _currentUser.Id ?? Guid.Empty;

        if (senderId == Guid.Empty && Context.User != null)
        {
            var subClaim = Context.User.FindFirst("sub")?.Value
                        ?? Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? Context.User.FindFirst(AbpClaimTypes.UserId)?.Value
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

        ChatMessage chatMsg;
        // 1. Lưu tin nhắn vào Database và Commit Transaction qua UnitOfWork
        using (var uow = _unitOfWorkManager.Begin())
        {
            chatMsg = new ChatMessage(Guid.NewGuid(), senderId, receiverId, senderName, message);
            await _chatRepository.InsertAsync(chatMsg, autoSave: true);
            await uow.CompleteAsync();
        }

        // 2. Bắn Real-time qua SignalR
        var payload = new
        {
            id = chatMsg.Id,
            senderId = senderId,
            senderName = senderName,
            receiverId = receiverId,
            message = message,
            creationTime = chatMsg.CreationTime
        };

        // Gửi về cho chính người gửi (Caller) đảm bảo hiển thị ngay lập tức
        await Clients.Caller.SendAsync("ReceiveMessage", payload);

        // Gửi cho người nhận cụ thể
        if (receiverId != Guid.Empty && receiverId != senderId)
        {
            await Clients.User(receiverId.ToString().ToLowerInvariant())
                .SendAsync("ReceiveMessage", payload);
        }

        // Bắn thêm vào Group Admins (trừ ConnectionId hiện tại) để các tab Admin khác nhận được ngay lập tức
        await Clients.GroupExcept("Admins", Context.ConnectionId).SendAsync("ReceiveMessage", payload);
    }
}
