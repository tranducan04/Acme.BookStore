using Acme.BookStore.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace Acme.BookStore.Permissions;

/// <summary>
/// Lớp khai báo danh sách Phân quyền (Permissions) trong hệ thống ABP Framework.
/// Các quyền này sẽ xuất hiện trên màn hình quản lý Quyền của Admin để tích chọn cho từng Role/User.
/// </summary>
public class BookStorePermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        // 1. Tạo Nhóm quyền chính cho Cửa hàng Sách
        var bookStoreGroup = context.AddGroup(BookStorePermissions.GroupName, L("Permission:BookStore"));

        // 2. Định nghĩa Nhóm quyền Quản lý Sách (Books)
        var booksPermission = bookStoreGroup.AddPermission(BookStorePermissions.Books.Default, L("Permission:Books"));
        booksPermission.AddChild(BookStorePermissions.Books.Create, L("Permission:Books.Create")); // Quyền Tạo/Thêm Sách mới
        booksPermission.AddChild(BookStorePermissions.Books.Edit, L("Permission:Books.Edit"));     // Quyền Sửa/Chỉnh Tồn kho Sách
        booksPermission.AddChild(BookStorePermissions.Books.Delete, L("Permission:Books.Delete")); // Quyền Xóa Sách

        // 3. Định nghĩa Nhóm quyền Quản lý Tác giả (Authors)
        var authorsPermission = bookStoreGroup.AddPermission(BookStorePermissions.Authors.Default, L("Permission:Authors"));
        authorsPermission.AddChild(BookStorePermissions.Authors.Create, L("Permission:Authors.Create")); // Quyền Thêm Tác giả
        authorsPermission.AddChild(BookStorePermissions.Authors.Edit, L("Permission:Authors.Edit"));     // Quyền Sửa Tác giả
        authorsPermission.AddChild(BookStorePermissions.Authors.Delete, L("Permission:Authors.Delete")); // Quyền Xóa Tác giả
    }

    /// <summary>
    /// Hàm trợ giúp lấy chuỗi ngôn ngữ đã Việt hóa từ tài nguyên BookStoreResource
    /// </summary>
    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<BookStoreResource>(name);
    }
}
