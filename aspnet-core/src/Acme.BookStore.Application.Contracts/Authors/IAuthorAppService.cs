using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Authors;

public interface IAuthorAppService :
    ICrudAppService<
        AuthorDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateAuthorDto,
        UpdateAuthorDto>
{
    Task<ListResultDto<AuthorLookupDto>> GetAuthorLookupAsync();
}
