using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Categories
{
    public interface ICategoryAppService : IApplicationService
    {
        Task<CategoryDto> GetAsync(Guid id);
        Task<PagedResultDto<CategoryDto>> GetListAsync(PagedAndSortedResultRequestDto input);
        Task<CategoryDto> CreateAsync(CreateUpdateCategoryDto input);
        Task<CategoryDto> UpdateAsync(Guid id, CreateUpdateCategoryDto input);
        Task DeleteAsync(Guid id);
    }
}
