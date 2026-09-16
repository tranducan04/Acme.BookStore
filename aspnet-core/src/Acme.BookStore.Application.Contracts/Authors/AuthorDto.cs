using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Authors;

/// <summary>
/// DTO chứa thông tin Tác giả gửi về cho Frontend Angular.
/// Kế thừa EntityDto<Guid> để tự động có thuộc tính Id kiểu Guid.
/// </summary>
public class AuthorDto : EntityDto<Guid>
{
    // Tên Tác giả (ví dụ: "J.K. Rowling")
    public string Name { get; set; } = string.Empty;

    // Ngày tháng năm sinh của Tác giả
    public DateTime BirthDate { get; set; }

    // Tiểu sử ngắn gọn của Tác giả (Có thể null)
    public string? ShortBio { get; set; }
}
