using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Volo.Abp.Security.Claims;

namespace Acme.BookStore.Hubs;

public class AbpUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var id = connection.User?.FindFirst("sub")?.Value
              ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
              ?? connection.User?.FindFirst(AbpClaimTypes.UserId)?.Value;

        return id?.ToLowerInvariant();
    }
}
