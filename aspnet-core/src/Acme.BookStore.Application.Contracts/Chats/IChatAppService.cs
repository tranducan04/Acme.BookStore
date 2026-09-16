using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Chats;

public interface IChatAppService : IApplicationService
{
    // 1. Lấy lịch sử chat giữa người dùng hiện tại và 1 người khác
    Task<List<ChatMessageDto>> GetMyChatHistoryAsync(Guid otherUserId);

    // 2. Dành cho Admin: Lấy danh sách toàn bộ cuộc hội thoại của các Khách hàng
    Task<List<ConversationDto>> GetAdminConversationListAsync();

    // 3. Đánh dấu đã đọc tất cả tin nhắn từ 1 người gửi
    Task MarkAsReadAsync(Guid senderId);
}
