using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Publishers;

public class PublisherDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
}
