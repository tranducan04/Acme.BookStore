using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Publishers;

public interface IPublisherAppService :
    ICrudAppService<
        PublisherDto,               // DTO hiển thị danh sách & chi tiết
        Guid,                       // Khóa chính Id
        PagedAndSortedResultRequestDto, // DTO phân trang & sắp xếp
        CreateUpdatePublisherDto>   // DTO tạo mới & chỉnh sửa
{
}
