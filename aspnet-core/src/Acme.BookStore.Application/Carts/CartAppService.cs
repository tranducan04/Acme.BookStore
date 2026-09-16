using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Books;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Carts;

/// <summary>
/// Service quản lý Giỏ hàng của Khách hàng (Thêm sản phẩm, cập nhật số lượng, xóa item).
/// Kế thừa ApplicationService của ABP và thực thi interface ICartAppService.
/// </summary>
public class CartAppService : ApplicationService, ICartAppService
{
    private readonly IRepository<Cart, Guid> _cartRepository;
    private readonly IRepository<Book, Guid> _bookRepository;

    public CartAppService(
        IRepository<Cart, Guid> cartRepository,
        IRepository<Book, Guid> bookRepository)
    {
        _cartRepository = cartRepository;
        _bookRepository = bookRepository;
    }

    /// <summary>
    /// Lấy thông tin Giỏ hàng hiện tại của người dùng.
    /// Tự động tính tổng tiền và đính kèm chi tiết Tên sách, Giá sách.
    /// </summary>
    public async Task<CartDto> GetAsync()
    {
        var cart = await GetOrCreateCartAsync();
        var dto = new CartDto
        {
            Id = cart.Id,
            UserId = CurrentUser.Id ?? Guid.Empty
        };

        foreach (var item in cart.Items)
        {
            var book = await _bookRepository.FindAsync(item.BookId);
            if (book != null)
            {
                var itemDto = new CartItemDto
                {
                    Id = item.Id,
                    BookId = item.BookId,
                    BookName = book.Name,
                    Price = (decimal)book.Price,
                    Count = item.Count
                };
                dto.Items.Add(itemDto);
            }
        }

        return dto;
    }

    /// <summary>
    /// Thêm sản phẩm vào giỏ hàng thông qua DTO AddBookToCartDto.
    /// </summary>
    public async Task PostToCartAsync(AddBookToCartDto input)
    {
        var cart = await GetOrCreateCartAsync();
        var item = cart.Items.FirstOrDefault(x => x.BookId == input.BookId);
        if (item != null)
        {
            item.Count += input.Count > 0 ? input.Count : 1; // Tăng số lượng nếu đã có trong giỏ
        }
        else
        {
            cart.Items.Add(new CartItem { CartId = cart.Id, BookId = input.BookId, Count = input.Count > 0 ? input.Count : 1 }); // Thêm item mới
        }

        await _cartRepository.UpdateAsync(cart, autoSave: true);
    }

    /// <summary>
    /// Cập nhật số lượng của 1 sản phẩm trong giỏ hàng. Nếu count <= 0 thì tự động xóa item.
    /// </summary>
    public async Task PutCartItemAsync(Guid bookId, int count)
    {
        var cart = await GetOrCreateCartAsync();
        var item = cart.Items.FirstOrDefault(x => x.BookId == bookId);
        if (item != null)
        {
            if (count <= 0)
            {
                cart.Items.Remove(item); // Xóa khỏi giỏ nếu số lượng = 0
            }
            else
            {
                item.Count = count; // Cập nhật số lượng mới
            }
            await _cartRepository.UpdateAsync(cart, autoSave: true);
        }
    }

    /// <summary>
    /// Xóa 1 sản phẩm khỏi giỏ hàng theo bookId.
    /// </summary>
    public async Task DeleteFromCartAsync(Guid bookId)
    {
        await PutCartItemAsync(bookId, 0);
    }

    /// <summary>
    /// Hàm trợ giúp lấy Giỏ hàng hiện tại hoặc tự động khởi tạo Giỏ hàng mới nếu chưa có.
    /// </summary>
    private async Task<Cart> GetOrCreateCartAsync()
    {
        var userId = CurrentUser.Id;
        var queryable = await _cartRepository.WithDetailsAsync(x => x.Items);
        var cart = userId.HasValue 
            ? queryable.FirstOrDefault(x => x.UserId == userId.Value)
            : queryable.FirstOrDefault();

        if (cart == null)
        {
            cart = new Cart 
            { 
                UserId = userId ?? Guid.Empty,
                Items = new List<CartItem>() 
            };
            cart = await _cartRepository.InsertAsync(cart, autoSave: true);
        }

        return cart;
    }
}

