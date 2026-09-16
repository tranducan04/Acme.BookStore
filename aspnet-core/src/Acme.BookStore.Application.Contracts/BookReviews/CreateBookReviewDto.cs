using System;
using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.BookReviews;

public class CreateBookReviewDto
{
    [Required(ErrorMessage = "Vui lòng chọn sách")]
    public Guid BookId { get; set; }

    [Range(1, 5, ErrorMessage = "Số sao đánh giá phải từ 1 đến 5!")]
    public int Rating { get; set; } = 5;

    [Required(ErrorMessage = "Vui lòng nhập nội dung đánh giá!")]
    [StringLength(1000, ErrorMessage = "Nội dung nhận xét tối đa 1000 ký tự.")]
    public string Comment { get; set; } = string.Empty;
}
