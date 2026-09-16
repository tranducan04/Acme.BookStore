using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Categories
{
    public class CategoryDto : AuditedEntityDto<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
