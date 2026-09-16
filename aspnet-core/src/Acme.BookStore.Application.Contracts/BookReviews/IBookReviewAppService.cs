using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.BookReviews;

public interface IBookReviewAppService : IApplicationService
{
    Task<BookReviewSummaryDto> GetSummaryAsync(Guid bookId);

    Task<PagedResultDto<BookReviewDto>> GetListAdminAsync(PagedAndSortedResultRequestDto input, string? filter = null, int? rating = null);

    Task<BookReviewDto> CreateAsync(CreateBookReviewDto input);

    Task DeleteAsync(Guid id);
}
