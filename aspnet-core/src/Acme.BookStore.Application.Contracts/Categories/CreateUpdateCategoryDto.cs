using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.Categories
{
    public class CreateUpdateCategoryDto
    {
        [Required(ErrorMessage = "Vui lòng nhập tên danh mục")]
        [StringLength(128)]
        public string Name { get; set; } = string.Empty;

        [StringLength(512)]
        [Required(ErrorMessage = "Vui lòng nhập mô tả")]
        public string? Description { get; set; }
    }
}
