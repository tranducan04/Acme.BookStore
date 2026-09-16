using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Authors;
using Acme.BookStore.Categories;
using Acme.BookStore.Permissions;
using Acme.BookStore.Publishers;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Books;

/// <summary>
/// Service xử lý toàn bộ nghiệp vụ Quản lý Sách (CRUD & Phân trang & Join Tác giả & Join NXB).
/// </summary>
public class BookAppService : CrudAppService<Book, BookDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateBookDto>, IBookAppService
{
    private readonly IRepository<Author, Guid> _authorRepository;
    private readonly IRepository<Publisher, Guid> _publisherRepository;
    private readonly IRepository<Category, Guid> _categoryRepository;
    public BookAppService(
        IRepository<Book, Guid> repository, 
        IRepository<Author, Guid> authorRepository,
        IRepository<Publisher, Guid> publisherRepository,
        IRepository<Category, Guid> categoryRepository) : base(repository)
        
    {
        _authorRepository = authorRepository;
        _publisherRepository = publisherRepository;
        _categoryRepository = categoryRepository; 

        // Phân quyền ABP
        GetPolicyName = BookStorePermissions.Books.Default;
        GetListPolicyName = BookStorePermissions.Books.Default;
        CreatePolicyName = BookStorePermissions.Books.Create;
        UpdatePolicyName = BookStorePermissions.Books.Edit;
        DeletePolicyName = BookStorePermissions.Books.Delete;
    }

        // 🌟 LẤY CHI TIẾT 1 CUỐN SÁCH THEO ID (JOIN TÁC GIẢ + NXB + DANH MỤC)
    public override async Task<BookDto> GetAsync(Guid id)
    {
        var book = await Repository.GetAsync(id);
        var bookDto = ObjectMapper.Map<Book, BookDto>(book);
        bookDto.OriginalPrice = book.OriginalPrice;

        if (book.AuthorId.HasValue)
        {
            var author = await _authorRepository.FindAsync(book.AuthorId.Value);
            bookDto.AuthorName = author?.Name ?? "Chưa rõ";
        }

        if (book.PublisherId.HasValue)
        {
            var publisher = await _publisherRepository.FindAsync(book.PublisherId.Value);
            bookDto.PublisherName = publisher?.Name ?? "Chưa rõ";
        }

        // 🌟 LẤY TÊN DANH MỤC
        if (book.CategoryId.HasValue)
        {
            var category = await _categoryRepository.FindAsync(book.CategoryId.Value);
            bookDto.CategoryName = category?.Name ?? "Chưa rõ";
        }

        return bookDto;
    }
      // 🌟 LẤY DANH SÁCH SÁCH CÓ PHÂN TRANG (LINQ JOIN 4 BẢNG: SÁCH + TÁC GIẢ + NXB + DANH MỤC)
    public override async Task<PagedResultDto<BookDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var bookQueryable = await Repository.GetQueryableAsync();
        var authorQueryable = await _authorRepository.GetQueryableAsync();
        var publisherQueryable = await _publisherRepository.GetQueryableAsync();
        var categoryQueryable = await _categoryRepository.GetQueryableAsync(); // 👈 LẤY QUERYABLE CATEGORY
        // LINQ Left Join lấy Tác giả, NXB và Danh mục
        var query = from book in bookQueryable
                    join author in authorQueryable on book.AuthorId equals author.Id into authors
                    from author in authors.DefaultIfEmpty()
                    join publisher in publisherQueryable on book.PublisherId equals publisher.Id into publishers
                    from publisher in publishers.DefaultIfEmpty()
                    join category in categoryQueryable on book.CategoryId equals category.Id into categories // 👈 JOIN CATEGORY
                    from category in categories.DefaultIfEmpty()
                    select new { book, author, publisher, category };
        var totalCount = await AsyncExecuter.CountAsync(query);
        query = query.OrderByDescending(x => x.book.CreationTime)
                     .Skip(input.SkipCount)
                     .Take(input.MaxResultCount);
        var queryResult = await AsyncExecuter.ToListAsync(query);
        var bookDtos = queryResult.Select(x =>
        {
            var bookDto = ObjectMapper.Map<Book, BookDto>(x.book);
            bookDto.OriginalPrice = x.book.OriginalPrice;
            bookDto.AuthorName = x.author != null ? x.author.Name : "Chưa rõ";
            bookDto.PublisherName = x.publisher != null ? x.publisher.Name : "Chưa rõ";
            bookDto.CategoryName = x.category != null ? x.category.Name : null; // 👈 GÁN TÊN DANH MỤC
            return bookDto;
        }).ToList();
        return new PagedResultDto<BookDto>(totalCount, bookDtos);
    }
}
