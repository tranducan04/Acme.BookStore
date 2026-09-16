using System;
using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Books;

/// <summary>
/// DTO chứa dữ liệu nhận từ Form Frontend khi người dùng Thêm mới hoặc Chỉnh sửa Sách.
/// </summary>
public class CreateUpdateBookDto
{
    // Tên cuốn sách (Bắt buộc nhập, tối đa 128 ký tự)
    [Required(ErrorMessage = "Vui lòng nhập tên sách")]
    [StringLength(128)]
    public string Name { get; set; } = string.Empty;
    // Thể loại sách chọn từ Dropdown (Bắt buộc)
    [Required(ErrorMessage = "Vui lòng chọn thể loại sách")]
    public BookType Type { get; set; } = BookType.Undefined;
    // Ngày xuất bản (Bắt buộc, định dạng DataType.Date)
    [Required(ErrorMessage = "Vui lòng chọn ngày xuất bản")]
    [DataType(DataType.Date)]
    public DateTime PublishDate { get; set; } = DateTime.Now;
    // Giá bán sách (Bắt buộc)
    [Required(ErrorMessage = "Vui lòng nhập giá bán sách")]
    public float Price { get; set; }
    // Giá gốc người dùng nhập (Tùy chọn, có thể null nếu sách bán đúng giá)
    public float? OriginalPrice { get; set; }
    // Mã Tác giả được chọn từ danh sách Dropdown
    [Required(ErrorMessage = "Vui lòng chọn tác giả")]
    public Guid? AuthorId { get; set; }
    // Mã Nhà xuất bản người dùng chọn từ Dropdown
    [Required(ErrorMessage = "Vui lòng chọn nhà xuất bản")]
    public Guid? PublisherId { get; set; }
    // Số lượng nhập kho ban đầu (Mặc định 50 cuốn)
    public int StockCount { get; set; } = 50;
    // Đường link URL ảnh bìa sách
    public string? CoverImage { get; set; }
    [Required(ErrorMessage = "Vui lòng chọn danh mục")]
    public Guid? CategoryId { get; set; }
    //giới hạn độ tuổi
    public int AgeLimit { get; set; }


}