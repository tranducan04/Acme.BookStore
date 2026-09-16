using Volo.Abp.Mapperly;
using Riok.Mapperly.Abstractions;
using Acme.BookStore.Books;
using Acme.BookStore.Authors;
using Acme.BookStore.Publishers;
using Acme.BookStore.Categories;

namespace Acme.BookStore;

[Mapper]
public partial class BookToBookDtoMapper : MapperBase<Book, BookDto>
{
    public override partial BookDto Map(Book source);
    public override partial void Map(Book source, BookDto destination);
}

[Mapper]
public partial class CreateUpdateBookDtoToBookMapper : MapperBase<CreateUpdateBookDto, Book>
{
    public override partial Book Map(CreateUpdateBookDto source);
    public override partial void Map(CreateUpdateBookDto source, Book destination);
}

[Mapper]
public partial class BookDtoToBookMapper : MapperBase<BookDto, Book>
{
    public override partial Book Map(BookDto source);
    public override partial void Map(BookDto source, Book destination);
}
[Mapper]
public partial class AuthorToAuthorDtoMapper : MapperBase<Author, AuthorDto>
{
    public override partial AuthorDto Map(Author source);
    public override partial void Map(Author source, AuthorDto destination);
}
[Mapper]
public partial class CreateAuthorDtoToAuthorMapper : MapperBase<CreateAuthorDto, Author>
{
    public override partial Author Map(CreateAuthorDto source);
    public override partial void Map(CreateAuthorDto source, Author destination);
}
[Mapper]
public partial class UpdateAuthorDtoToAuthorMapper : MapperBase<UpdateAuthorDto, Author>
{
    public override partial Author Map(UpdateAuthorDto source);
    public override partial void Map(UpdateAuthorDto source, Author destination);
}
[Mapper]
public partial class AuthorToAuthorLookupDtoMapper : MapperBase<Author, AuthorLookupDto>
{
    public override partial AuthorLookupDto Map(Author source);
    public override partial void Map(Author source, AuthorLookupDto destination);
}
[Mapper]
public partial class PublisherToPublisherDtoMapper : MapperBase<Publisher, PublisherDto>
{
    public override partial PublisherDto Map(Publisher source);
    public override partial void Map(Publisher source, PublisherDto destination);
}

[Mapper]
public partial class CreateUpdatePublisherDtoToPublisherMapper : MapperBase<CreateUpdatePublisherDto, Publisher>
{
    public override partial Publisher Map(CreateUpdatePublisherDto source);
    public override partial void Map(CreateUpdatePublisherDto source, Publisher destination);
}
[Mapper]
public partial class CategoryToCategoryDtoMapper : MapperBase<Category, CategoryDto>
{
    public override partial CategoryDto Map(Category source);
    public override partial void Map(Category source, CategoryDto destination);
}

[Mapper]
public partial class CreateUpdateCategoryDtoToCategoryMapper : MapperBase<CreateUpdateCategoryDto, Category>
{
    public override partial Category Map(CreateUpdateCategoryDto source);
    public override partial void Map(CreateUpdateCategoryDto source, Category destination);
}

[Mapper]
public partial class CategoryDtoToCategoryMapper : MapperBase<CategoryDto, Category>
{
    public override partial Category Map(CategoryDto source);
    public override partial void Map(CategoryDto source, Category destination);
}
