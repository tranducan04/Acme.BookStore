using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Acme.BookStore.Chats;

public class ChatMessage : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    public Guid SenderId { get; set; }       // ID người gửi (Khách hoặc Admin)
    public Guid ReceiverId { get; set; }     // ID người nhận
    public string SenderName { get; set; }   // Tên hiển thị người gửi
    public string Message { get; set; }      // Nội dung tin nhắn
    public bool IsRead { get; set; }         // Trạng thái đã đọc

    public ChatMessage() { }

    public ChatMessage(Guid id, Guid senderId, Guid receiverId, string senderName, string message) : base(id)
    {
        SenderId = senderId;
        ReceiverId = receiverId;
        SenderName = senderName;
        Message = message;
        IsRead = false;
    }
}
