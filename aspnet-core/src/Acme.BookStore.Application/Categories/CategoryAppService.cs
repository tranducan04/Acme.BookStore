using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Acme.BookStore.Permissions;
using Acme.BookStore.Books;       
using Volo.Abp; 

namespace Acme.BookStore.Categories
{
    public class CategoryAppService :
        CrudAppService<
            Category,
            CategoryDto,
            Guid,
            PagedAndSortedResultRequestDto,
            CreateUpdateCategoryDto>,
        ICategoryAppService
    {   
        private readonly IRepository<Book, Guid> _bookRepository;
        private readonly IRepository<Category, Guid> _catRepo;

        public CategoryAppService(IRepository<Category, Guid> repository, IRepository<Book, Guid> bookRepository)
            : base(repository)
        {
            _catRepo = repository;
            _bookRepository = bookRepository;
        }

        /// <summary>
        /// Ghi đè hàm Xóa Danh Mục: Kiểm tra xem Danh mục có dính sách không trước khi xóa
        /// </summary>
        public override async Task DeleteAsync(Guid id)
        {
            var hasBooks = await _bookRepository.AnyAsync(x => x.CategoryId == id);
            if (hasBooks)
            {
                throw new UserFriendlyException("⚠️ Không thể xóa Danh mục này vì đang có sách thuộc danh mục này trong cửa hàng! Vui lòng xóa hoặc thay đổi danh mục cho các cuốn sách tương ứng trước.");
            }
            await base.DeleteAsync(id);
        }
        public override async Task<PagedResultDto<CategoryDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            // ⚡ Tự động nạp 8 danh mục mặc định nếu database chưa có
            if (await _catRepo.GetCountAsync() <= 1)
            {
                var defaultCategories = new[]
                {
                    new { Name = "Phiêu lưu", Desc = "Sách thám hiểm và hành trình mạo hiểm" },
                    new { Name = "Tiểu sử", Desc = "Cuộc đời và sự nghiệp các danh nhân lịch sử" },
                    new { Name = "Viễn tưởng / Dystopian", Desc = "Thế giới tương lai và xã hội giả tưởng" },
                    new { Name = "Kỳ ảo / Fantasy", Desc = "Thế giới phép thuật và thần thoại kỳ bí" },
                    new { Name = "Kinh dị", Desc = "Truyện hồi hộp, rùng rợn và tâm lý giật gân" },
                    new { Name = "Khoa học", Desc = "Tri thức tự nhiên, công nghệ và khám phá" },
                    new { Name = "Khoa học viễn tưởng", Desc = "Du hành vũ trụ, công nghệ tương lai và AI" },
                    new { Name = "Thơ ca", Desc = "Nghệ thuật ngôn từ và tuyển tập thơ ca" },
                };

                foreach (var item in defaultCategories)
                {
                    if (!await _catRepo.AnyAsync(x => x.Name == item.Name))
                    {
                        await _catRepo.InsertAsync(new Category(Guid.NewGuid(), item.Name, item.Desc), autoSave: true);
                    }
                }
            }

            return await base.GetListAsync(input);
        }
    }
}
