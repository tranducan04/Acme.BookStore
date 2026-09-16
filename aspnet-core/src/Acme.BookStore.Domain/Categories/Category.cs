using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Categories
{
    public class Category : AuditedAggregateRoot<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public Category()
        {
        }

        public Category(Guid id, string name, string? description = null) : base(id)
        {
            Name = name;
            Description = description;
        }
    }
}
