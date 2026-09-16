using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Acme.BookStore.Authors;

public class Author : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string? ShortBio { get; set; }

    public Author()
    {
    }

    public Author(Guid id, string name, DateTime birthDate, string? shortBio = null)
        : base(id)
    {
        Name = name;
        BirthDate = birthDate;
        ShortBio = shortBio;
    }
}
