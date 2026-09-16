using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Acme.BookStore.Books;  
using Acme.BookStore.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Authors;

/// <summary>
/// Service xử lý nghiệp vụ Quản lý Tác giả (Thêm, Xem, Sửa, Xóa).
/// Kế thừa CrudAppService của ABP và tích hợp phân quyền tự động.
/// </summary>
public class AuthorAppService :
    CrudAppService<
        Author,                         // Entity Tác giả trong CSDL
        AuthorDto,                      // DTO trả về cho FE
        Guid,                           // Kiểu Khóa chính (Guid)
        PagedAndSortedResultRequestDto, // DTO phân trang
        CreateAuthorDto,                // DTO khi Thêm mới
        UpdateAuthorDto>,               // DTO khi Sửa
    IAuthorAppService
{   
    private readonly IRepository<Book, Guid> _bookRepository;
    public AuthorAppService(IRepository<Author, Guid> repository,
                            IRepository<Book, Guid> bookRepository)
        : base(repository)
    {
        _bookRepository = bookRepository;
        // Gán phân quyền tự động của ABP
        GetPolicyName = BookStorePermissions.Authors.Default;     // Xem thông tin
        GetListPolicyName = BookStorePermissions.Authors.Default; // Xem danh sách
        CreatePolicyName = BookStorePermissions.Authors.Create;   // Quyền Tạo tác giả
        UpdatePolicyName = BookStorePermissions.Authors.Edit;     // Quyền Sửa tác giả
        DeletePolicyName = BookStorePermissions.Authors.Delete;   // Quyền Xóa tác giả
    }
    
    /// <summary>
    /// Ghi đè hàm Xóa Tác giả: Kiểm tra ràng buộc sách trước khi xóa.
    /// </summary>
    public override async Task DeleteAsync(Guid id)
    {
        // 1. Kiểm tra xem tác giả này có đang được gán cho cuốn sách nào không
        var hasBooks = await _bookRepository.AnyAsync(x => x.AuthorId == id);
        if (hasBooks)
        {
            // 2. Nếu có dính sách -> Quăng lỗi thông báo dừng lại ngay!
            throw new UserFriendlyException("⚠️ Không thể xóa tác giả này vì đang có sách trong cửa hàng! Vui lòng xóa hoặc thay đổi tác giả cho các cuốn sách tương ứng trước.");
        }
       await base.DeleteAsync(id);
    }
    public async Task<ListResultDto<AuthorLookupDto>> GetAuthorLookupAsync()
    {
        // 1. Lấy danh sách toàn bộ tác giả từ CSDL
        var authors = await Repository.GetListAsync();

        // 2. Chuyển đổi từ danh sách Author sang danh sách AuthorLookupDto
        return new ListResultDto<AuthorLookupDto>(
            ObjectMapper.Map<List<Author>, List<AuthorLookupDto>>(authors)
        );
    }
}
