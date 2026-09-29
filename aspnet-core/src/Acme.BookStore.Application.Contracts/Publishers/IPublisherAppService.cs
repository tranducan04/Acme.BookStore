using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Publishers;

public interface IPublisherAppService : IApplicationService
{
    Task<PublisherDto> GetAsync(Guid id);
    Task<PagedResultDto<PublisherDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<PublisherDto> CreateAsync(CreateUpdatePublisherDto input);
    Task<PublisherDto> UpdateAsync(Guid id, CreateUpdatePublisherDto input);
    Task DeleteAsync(Guid id);
}
