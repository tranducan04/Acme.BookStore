using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Publishers;
    public class Publisher: AuditedAggregateRoot<Guid>
    {
         // Tên Nhà xuất bản (ví dụ: NXB Kim Đồng, NXB Trẻ)
    public string Name { get; set; } = string.Empty;
    // Địa chỉ trụ sở của Nhà xuất bản
    public string? Address { get; set; }
    // Số điện thoại liên hệ
    public string? PhoneNumber { get; set; }
    // Constructor rỗng bắt buộc cho ORM Entity Framework Core
   public Publisher()
{
}
       // Constructor khởi tạo
    public Publisher(Guid id, string name, string? address = null, string? phoneNumber = null)
        : base(id)
    {
        Name = name;
        Address = address;
        PhoneNumber = phoneNumber;
    }
}