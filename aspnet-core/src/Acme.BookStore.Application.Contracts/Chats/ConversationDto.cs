using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Chats;

public class ConversationDto : EntityDto<Guid>
{
    public Guid UserId { get; set; }              // ID của Khách hàng
    public string UserName { get; set; } = string.Empty;          // Tên Khách hàng
    public string LastMessage { get; set; } = string.Empty;       // Tin nhắn mới nhất
    public DateTime LastMessageTime { get; set; }  // Thời gian của tin nhắn mới nhất
    public int UnreadCount { get; set; }          // Số tin nhắn chưa đọc từ khách này
}
