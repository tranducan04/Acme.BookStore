using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace Acme.BookStore.BookReviews;

/// <summary>
/// Entity lưu thông tin Đánh giá & Nhận xét của Khách hàng cho từng Cuốn sách
/// </summary>
public class BookReview : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    // Mã sách được đánh giá
    public Guid BookId { get; set; }

    // Mã người dùng đánh giá
    public Guid UserId { get; set; }

    // Tên người dùng hiển thị
    public string UserName { get; set; } = string.Empty;

    // Số sao đánh giá: 1 đến 5 sao
    public int Rating { get; set; }

    // Nội dung bình luận / nhận xét
    public string Comment { get; set; } = string.Empty;

    public BookReview()
    {
    }

    public BookReview(Guid id, Guid bookId, Guid userId, string userName, int rating, string comment)
        : base(id)
    {
        BookId = bookId;
        UserId = userId;
        UserName = userName;
        Rating = Math.Clamp(rating, 1, 5);
        Comment = comment;
    }
}
