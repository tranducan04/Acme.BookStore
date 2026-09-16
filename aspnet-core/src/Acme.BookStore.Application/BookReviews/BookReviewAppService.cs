using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Authors;
using Acme.BookStore.Books;
using Acme.BookStore.Publishers;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace Acme.BookStore.BookReviews;

public class BookReviewAppService : ApplicationService, IBookReviewAppService
{
    private readonly IRepository<BookReview, Guid> _reviewRepository;
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<Author, Guid> _authorRepository;
    private readonly IRepository<Publisher, Guid> _publisherRepository;

    public BookReviewAppService(
        IRepository<BookReview, Guid> reviewRepository,
        IRepository<Book, Guid> bookRepository,
        IRepository<Author, Guid> authorRepository,
        IRepository<Publisher, Guid> publisherRepository)
    {
        _reviewRepository = reviewRepository;
        _bookRepository = bookRepository;
        _authorRepository = authorRepository;
        _publisherRepository = publisherRepository;
    }

    public async Task<BookReviewSummaryDto> GetSummaryAsync(Guid bookId)
    {
        var reviews = await _reviewRepository.GetListAsync(x => x.BookId == bookId);
        var orderedReviews = reviews.OrderByDescending(x => x.CreationTime).ToList();

        var totalReviews = orderedReviews.Count;
        var averageRating = totalReviews > 0
            ? Math.Round(orderedReviews.Average(x => x.Rating), 1)
            : 5.0;

        var reviewDtos = orderedReviews.Select(r => new BookReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            UserId = r.UserId,
            UserName = !string.IsNullOrWhiteSpace(r.UserName) ? r.UserName : "Khách hàng ẩn danh",
            Rating = r.Rating,
            Comment = r.Comment,
            CreationTime = r.CreationTime
        }).ToList();

        var currentBook = await _bookRepository.FindAsync(bookId);
        var recommendedBookDtos = new List<BookDto>();

        if (currentBook != null)
        {
            var queryable = await _bookRepository.GetQueryableAsync();
            
            // 🌟 CHỈ LẤY ĐÚNG SÁCH CÙNG THỂ LOẠI (KHÔNG LẤY THỂ LOẠI KHÁC BÙ VÀO)
            var similarBooks = queryable
                .Where(b => b.Id != bookId && b.Type == currentBook.Type)
                .OrderByDescending(b => b.CreationTime)
                .Take(4)
                .ToList();

            foreach (var b in similarBooks)
            {
                var dto = ObjectMapper.Map<Book, BookDto>(b);
                dto.OriginalPrice = b.OriginalPrice;

                if (b.AuthorId.HasValue)
                {
                    var author = await _authorRepository.FindAsync(b.AuthorId.Value);
                    dto.AuthorName = author?.Name ?? "Chưa rõ";
                }

                if (b.PublisherId.HasValue)
                {
                    var publisher = await _publisherRepository.FindAsync(b.PublisherId.Value);
                    dto.PublisherName = publisher?.Name ?? "Chưa rõ";
                }

                recommendedBookDtos.Add(dto);
            }
        }
        return new BookReviewSummaryDto
        {
            BookId = bookId,
            AverageRating = averageRating,
            TotalReviews = totalReviews,
            Reviews = reviewDtos,
            RecommendedBooks = recommendedBookDtos
        };
    }

    [Authorize]
    public async Task<PagedResultDto<BookReviewDto>> GetListAdminAsync(PagedAndSortedResultRequestDto input, string? filter = null, int? rating = null)
    {
        var queryable = await _reviewRepository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(filter))
        {
            queryable = queryable.Where(x => x.Comment.Contains(filter) || x.UserName.Contains(filter));
        }

        if (rating.HasValue && rating.Value > 0)
        {
            queryable = queryable.Where(x => x.Rating == rating.Value);
        }

        var totalCount = queryable.Count();
        var reviews = queryable
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var bookIds = reviews.Select(r => r.BookId).Distinct().ToList();
        var books = (await _bookRepository.GetListAsync(b => bookIds.Contains(b.Id)))
            .ToDictionary(b => b.Id, b => b.Name);

        var reviewDtos = reviews.Select(r => new BookReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            BookName = books.ContainsKey(r.BookId) ? books[r.BookId] : "Sách không xác định",
            UserId = r.UserId,
            UserName = !string.IsNullOrWhiteSpace(r.UserName) ? r.UserName : "Khách hàng ẩn danh",
            Rating = r.Rating,
            Comment = r.Comment,
            CreationTime = r.CreationTime
        }).ToList();

        return new PagedResultDto<BookReviewDto>(totalCount, reviewDtos);
    }

    [Authorize]
    public async Task<BookReviewDto> CreateAsync(CreateBookReviewDto input)
    {
        var currentUserId = CurrentUser.GetId();
        var currentUserName = CurrentUser.UserName ?? CurrentUser.Name ?? "Khách hàng";

        var review = new BookReview(
            GuidGenerator.Create(),
            input.BookId,
            currentUserId,
            currentUserName,
            input.Rating,
            input.Comment
        );

        await _reviewRepository.InsertAsync(review, autoSave: true);

        return new BookReviewDto
        {
            Id = review.Id,
            BookId = review.BookId,
            UserId = review.UserId,
            UserName = review.UserName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreationTime = review.CreationTime
        };
    }

    [Authorize]
    public async Task DeleteAsync(Guid id)
    {
        var review = await _reviewRepository.GetAsync(id);
        var currentUserId = CurrentUser.Id;
        var isAdmin = CurrentUser.IsInRole("admin");

        if (!isAdmin && review.UserId != currentUserId)
        {
            throw new UserFriendlyException("Bạn không có quyền xóa đánh giá của người khác!");
        }

        await _reviewRepository.DeleteAsync(review, autoSave: true);
    }
}
