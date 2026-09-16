using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Authors;
using Acme.BookStore.Books;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace Acme.BookStore.Wishlists;

[Authorize]
public class WishlistAppService : ApplicationService, IWishlistAppService
{
    private readonly IRepository<WishlistItem, Guid> _wishlistRepository;
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<Author, Guid> _authorRepository;

    public WishlistAppService(
        IRepository<WishlistItem, Guid> wishlistRepository,
        IRepository<Book, Guid> bookRepository,
        IRepository<Author, Guid> authorRepository)
    {
        _wishlistRepository = wishlistRepository;
        _bookRepository = bookRepository;
        _authorRepository = authorRepository;
    }

    public async Task<List<Guid>> GetMyWishlistBookIdsAsync()
    {
        var userId = CurrentUser.GetId();
        var items = await _wishlistRepository.GetListAsync(x => x.UserId == userId);
        return items.Select(x => x.BookId).ToList();
    }

    public async Task<List<WishlistItemDto>> GetMyWishlistAsync()
    {
        var userId = CurrentUser.GetId();
        var items = await _wishlistRepository.GetListAsync(x => x.UserId == userId);
        if (!items.Any()) return new List<WishlistItemDto>();

        var bookIds = items.Select(x => x.BookId).Distinct().ToList();
        var books = await _bookRepository.GetListAsync(x => bookIds.Contains(x.Id));

        var authorIds = books.Where(b => b.AuthorId.HasValue).Select(b => b.AuthorId!.Value).Distinct().ToList();
        var authors = (await _authorRepository.GetListAsync(a => authorIds.Contains(a.Id)))
            .ToDictionary(a => a.Id, a => a.Name);

        var result = new List<WishlistItemDto>();
        foreach (var item in items.OrderByDescending(x => x.CreationTime))
        {
            var book = books.FirstOrDefault(b => b.Id == item.BookId);
            if (book == null) continue;

            result.Add(new WishlistItemDto
            {
                Id = item.Id,
                BookId = book.Id,
                BookName = book.Name,
                CoverImage = book.CoverImage,
                Price = book.Price,
                OriginalPrice = book.OriginalPrice,
                Type = book.Type,
                StockCount = book.StockCount,
                AuthorName = book.AuthorId.HasValue && authors.ContainsKey(book.AuthorId.Value) ? authors[book.AuthorId.Value] : "Chưa rõ",
                CreationTime = item.CreationTime
            });
        }

        return result;
    }

    public async Task<bool> ToggleWishlistAsync(Guid bookId)
    {
        var userId = CurrentUser.GetId();
        var existing = await _wishlistRepository.FirstOrDefaultAsync(x => x.UserId == userId && x.BookId == bookId);

        if (existing != null)
        {
            await _wishlistRepository.DeleteAsync(existing, autoSave: true);
            return false; // Đã bỏ thích (tim trắng)
        }
        else
        {
            var newItem = new WishlistItem(GuidGenerator.Create(), userId, bookId);
            await _wishlistRepository.InsertAsync(newItem, autoSave: true);
            return true; // Đã thêm vào yêu thích (tim đỏ)
        }
    }
    // 🌟 API CHO ADMIN / TÁC GIẢ: LẤY DANH SÁCH SÁCH ĐƯỢC USER YÊU THÍCH NHIỀU NHẤT
    public async Task<List<FavoriteBookStatDto>> GetTopFavoriteBooksAsync()
    {
        var allWishlistItems = await _wishlistRepository.GetListAsync();
        if (!allWishlistItems.Any()) return new List<FavoriteBookStatDto>();
    // Gom nhóm theo từng cuốn sách và đếm số lượng người thả tim
        var grouped = allWishlistItems
            .GroupBy(x => x.BookId)
            .Select(g => new { BookId = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToList();
        var bookIds = grouped.Select(x => x.BookId).ToList();
        var books = await _bookRepository.GetListAsync(b => bookIds.Contains(b.Id));
        var authorIds = books.Where(b => b.AuthorId.HasValue).Select(b => b.AuthorId!.Value).Distinct().ToList();
        var authors = (await _authorRepository.GetListAsync(a => authorIds.Contains(a.Id)))
            .ToDictionary(a => a.Id, a => a.Name);
        var result = new List<FavoriteBookStatDto>();
        int rank = 1;
        foreach (var item in grouped)
        {
            var book = books.FirstOrDefault(b => b.Id == item.BookId);
            if (book == null) continue;
            result.Add(new FavoriteBookStatDto
            {
                Rank = rank++,
                BookId = book.Id,
                BookName = book.Name,
                CoverImage = book.CoverImage,
                Price = book.Price,
                StockCount = book.StockCount,
                AuthorName = book.AuthorId.HasValue && authors.ContainsKey(book.AuthorId.Value) ? authors[book.AuthorId.Value] : "Chưa rõ",
                FavoriteCount = item.Count
            });
        }
        return result;
    }
}
