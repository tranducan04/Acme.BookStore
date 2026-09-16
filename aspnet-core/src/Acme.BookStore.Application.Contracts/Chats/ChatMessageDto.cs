using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Chats;

public class ChatMessageDto : EntityDto<Guid>
{
    public Guid SenderId { get; set; }        // ID người gửi
    public Guid ReceiverId { get; set; }      // ID người nhận
    public string SenderName { get; set; } = string.Empty;    // Tên người gửi
    public string Message { get; set; } = string.Empty;       // Nội dung tin nhắn
    public bool IsRead { get; set; }          // Đã đọc chưa
    public bool IsMyMessage { get; set; }      // Đánh dấu true nếu đây là tin nhắn do chính mình gửi
    public DateTime CreationTime { get; set; } // Thời gian gửi
}
