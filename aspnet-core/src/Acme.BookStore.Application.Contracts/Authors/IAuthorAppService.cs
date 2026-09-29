using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Authors;

public interface IAuthorAppService : IApplicationService
{
    Task<AuthorDto> GetAsync(Guid id);
    Task<PagedResultDto<AuthorDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<AuthorDto> CreateAsync(CreateAuthorDto input);
    Task<AuthorDto> UpdateAsync(Guid id, UpdateAuthorDto input);
    Task DeleteAsync(Guid id);
    Task<ListResultDto<AuthorLookupDto>> GetAuthorLookupAsync();
}
