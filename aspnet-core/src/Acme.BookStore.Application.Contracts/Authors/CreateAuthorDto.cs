using System;
using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Authors;

public class CreateAuthorDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên tác giả")]
    [StringLength(64)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn ngày sinh")]
    public DateTime BirthDate { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập mô tả")]
    public string? ShortBio { get; set; }
}
