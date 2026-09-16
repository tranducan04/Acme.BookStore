using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Wishlists;

public interface IWishlistAppService : IApplicationService
{
    // Lấy danh sách ID các sách đã thả tim (để hiện tim đỏ trên thẻ sách)
    Task<List<Guid>> GetMyWishlistBookIdsAsync();

    // Lấy danh sách chi tiết các sách yêu thích (cho trang Wishlist)
    Task<List<WishlistItemDto>> GetMyWishlistAsync();

    // 1-Click Toggle: Nếu chưa thích thì Thêm, nếu đã thích thì Xóa
    Task<bool> ToggleWishlistAsync(Guid bookId);
    Task<List<FavoriteBookStatDto>> GetTopFavoriteBooksAsync();
}
