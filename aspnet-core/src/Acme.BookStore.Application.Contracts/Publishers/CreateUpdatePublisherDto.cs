using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Publishers;

public class CreateUpdatePublisherDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên nhà xuất bản")]      
    [StringLength(128)]
    public string Name { get; set; } = string.Empty;

    [StringLength(256)]
    [Required(ErrorMessage = "Vui lòng nhập địa chỉ nhà xuất bản")]
    public string? Address { get; set; }

    [StringLength(32)]
    [Required(ErrorMessage = "Vui lòng nhập số điện thoại nhà xuất bản")]
    public string? PhoneNumber { get; set; }
}
