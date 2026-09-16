using System;
using System.Threading.Tasks;
using Acme.BookStore.Books;  
using Volo.Abp.Application.Dtos;
using Volo.Abp;  
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Publishers;

/// <summary>
/// Service xử lý nghiệp vụ và tự động phơi bày thành REST API cho Nhà xuất bản.
/// Kế thừa CrudAppService giúp tự động có đủ 5 API:
/// 1. GET /api/app/publisher (Lấy danh sách có phân trang)
/// 2. GET /api/app/publisher/{id} (Lấy chi tiết 1 NXB)
/// 3. POST /api/app/publisher (Tạo mới NXB)
/// 4. PUT /api/app/publisher/{id} (Cập nhật NXB)
/// 5. DELETE /api/app/publisher/{id} (Xóa NXB)
/// </summary>
public class PublisherAppService :
    CrudAppService<
        Publisher,                      // Entity CSDL
        PublisherDto,                   // DTO trả về hiển thị
        Guid,                           // Kiểu khóa chính Id
        PagedAndSortedResultRequestDto, // DTO phân trang & sắp xếp
        CreateUpdatePublisherDto>,      // DTO tạo & sửa
    IPublisherAppService
{
    private readonly IRepository<Book, Guid> _bookRepository;
    public PublisherAppService(IRepository<Publisher, Guid> repository, IRepository<Book, Guid> bookRepository)
        : base(repository)
    {
        _bookRepository = bookRepository;
    }
     /// <summary>
    /// Ghi đè hàm Xóa Nhà Xuất Bản: Kiểm tra xem NXB có dính sách không trước khi xóa
    /// </summary>
    public override async Task DeleteAsync(Guid id)
    {
        var hasBooks = await _bookRepository.AnyAsync(x => x.PublisherId == id);
        if (hasBooks)
        {
            throw new UserFriendlyException("⚠️ Không thể xóa Nhà xuất bản này vì đang có sách thuộc NXB này trong cửa hàng! Vui lòng xóa hoặc thay đổi NXB cho các cuốn sách tương ứng trước.");
        }
        await base.DeleteAsync(id);
    }
}

