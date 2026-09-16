using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.BookReviews;

public class BookReviewDto : EntityDto<Guid>
{
    public Guid BookId { get; set; }
    public string BookName { get; set; } = string.Empty; // 👈 Thêm tên sách cho Admin dễ xem
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreationTime { get; set; }
}
