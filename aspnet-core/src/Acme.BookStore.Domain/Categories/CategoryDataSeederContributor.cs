using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Categories
{
    public class CategoryDataSeederContributor : IDataSeedContributor, ITransientDependency
    {
        private readonly IRepository<Category, Guid> _categoryRepository;

        public CategoryDataSeederContributor(IRepository<Category, Guid> categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task SeedAsync(DataSeedContext context)
        {
            // Nếu đã có từ 2 danh mục trở lên thì không cần nạp nữa
            if (await _categoryRepository.GetCountAsync() > 1)
            {
                return;
            }

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
                if (!await _categoryRepository.AnyAsync(x => x.Name == item.Name))
                {
                    await _categoryRepository.InsertAsync(
                        new Category(Guid.NewGuid(), item.Name, item.Desc),
                        autoSave: true
                    );
                }
            }
        }
    }
}
