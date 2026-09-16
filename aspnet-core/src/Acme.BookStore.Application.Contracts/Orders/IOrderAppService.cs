using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Orders;

public interface IOrderAppService : IApplicationService
{
    Task<OrderDto> PostAsync(CreateOrderDto input);
    Task<PagedResultDto<OrderDto>> GetMyOrdersAsync(PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<OrderDto>> GetListAsync(GetOrderFilterDto input);
    Task<OrderDto> PutStatusAsync(Guid id, UpdateOrderStatusDto input);
    Task<OrderDto> CancelMyOrderAsync(Guid id);
}
