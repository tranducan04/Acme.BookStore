using System;
using Volo.Abp.Application.Dtos;

namespace Acme.BookStore.Wishlists;

public class FavoriteBookStatDto : EntityDto<Guid>
{
    public int Rank { get; set; }
    public Guid BookId { get; set; }
    public string BookName { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public float Price { get; set; }
    public int StockCount { get; set; }
    public string AuthorName { get; set; } = "Chưa rõ";
    public int FavoriteCount { get; set; } // Tổng số lượt User đã thả tim
}
