using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Books;

/// <summary>
/// DTO thông tin Sách gửi về cho Frontend Angular hiển thị trên giao diện.
/// Kế thừa AuditedEntityDto<Guid> để có sẵn Id, CreationTime, CreatorId...
/// </summary>
public class BookDto : AuditedEntityDto<Guid>
{
    // Tên cuốn sách (ví dụ: "Đô-rê-mon")
    public string Name { get; set; } = string.Empty;

    // Thể loại sách (Mã Enum BookType)
    public BookType Type { get; set; }

    // Ngày xuất bản cuốn sách
    public DateTime PublishDate { get; set; }

    // Giá bán cuốn sách (Đơn vị VNĐ)
    public float Price { get; set; }
       // Giá gốc (Giá trước khi giảm, bị gạch ngang nếu có Flash Sale)
    public float? OriginalPrice { get; set; }
    // Mã khóa ngoại liên kết với Bảng Tác giả (Guid nullable)
    public Guid? AuthorId { get; set; }

    // Tên Tác giả (Được LINQ Join tự động điền từ bảng AppAuthors)
    public string AuthorName { get; set; } = string.Empty;
     // Mã Nhà xuất bản (Guid nullable)
    public Guid? PublisherId { get; set; }
    // Tên Nhà xuất bản (Được tự động Join từ bảng AppPublishers)
    public string PublisherName { get; set; } = string.Empty;
    // Số lượng tồn kho (Nếu > 0 là Còn hàng, <= 0 là Hết hàng)
    public int StockCount { get; set; } = 50;

    // Đường link đường dẫn ảnh bìa sách (URL)
    public string? CoverImage { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    //giới hạn độ tuổi
    public int AgeLimit { get; set; }


}