using System;
using System.Collections.Generic;
using Acme.BookStore.Books;

namespace Acme.BookStore.BookReviews;

public class BookReviewSummaryDto
{
    public Guid BookId { get; set; }
    
    // Điểm đánh giá trung bình (ví dụ: 4.8)
    public double AverageRating { get; set; }

    // Tổng số lượt đánh giá
    public int TotalReviews { get; set; }

    // Danh sách các đánh giá của người dùng
    public List<BookReviewDto> Reviews { get; set; } = new();

    // 💡 DANH SÁCH SÁCH GỢI Ý CÙNG THỂ LOẠI (Recommendations)
    public List<BookDto> RecommendedBooks { get; set; } = new();
}
