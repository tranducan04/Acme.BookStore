using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Carts;

public interface ICartAppService : IApplicationService
{
    Task<CartDto> GetAsync();
    Task PostToCartAsync(AddBookToCartDto input);
    Task PutCartItemAsync(Guid bookId, int count);
    Task DeleteFromCartAsync(Guid bookId);
}
