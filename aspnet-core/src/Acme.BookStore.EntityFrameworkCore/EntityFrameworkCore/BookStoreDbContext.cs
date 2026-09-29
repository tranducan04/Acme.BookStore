using Acme.BookStore.Books;
using Acme.BookStore.Authors;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Acme.BookStore.Carts;
using Acme.BookStore.Orders;
using Acme.BookStore.Publishers;
using Acme.BookStore.Authors;
using Acme.BookStore.BookReviews;
using Acme.BookStore.Wishlists;
using Acme.BookStore.Notifications;
using Acme.BookStore.Categories;
using Acme.BookStore.Chats;
using Acme.BookStore.Coupons;


namespace Acme.BookStore.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class BookStoreDbContext :
    AbpDbContext<BookStoreDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<Book> Books { get; set; }
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }
    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Publisher> Publishers { get; set; }   
    public DbSet<BookReview> BookReviews { get; set; }   
    public DbSet<WishlistItem> WishlistItems { get; set; }
    public DbSet<AppNotification> Notifications { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<Coupon> Coupons { get; set; }
    public DbSet<CouponUsage> CouponUsages { get; set; }



    #endregion

    public BookStoreDbContext(DbContextOptions<BookStoreDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();
               // 1. Cấu hình bảng Sách (Liên kết với cả Tác Giả và Nhà Xuất Bản)
        builder.Entity<Book>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Books", BookStoreConsts.DbSchema);
            b.ConfigureByConvention(); // Cấu hình thuộc tính Audit chuẩn ABP
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);

            // Khóa ngoại liên kết Tác giả (Cho phép null nếu sách chưa có tác giả)
            b.HasOne<Author>().WithMany().HasForeignKey(x => x.AuthorId).IsRequired(false);

            // Khóa ngoại liên kết Nhà xuất bản (Cho phép null nếu sách chưa gán NXB)
            b.HasOne<Publisher>().WithMany().HasForeignKey(x => x.PublisherId).IsRequired(false);
        });

        // 2. Cấu hình bảng Tác Giả
        builder.Entity<Author>(b =>
{
    b.ToTable(BookStoreConsts.DbTablePrefix + "Authors", BookStoreConsts.DbSchema);
    b.ConfigureByConvention();
    b.Property(x => x.Name).IsRequired().HasMaxLength(64);
    b.HasIndex(x => x.Name);
});

        // 3. Cấu hình bảng Nhà Xuất Bản
        builder.Entity<Publisher>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Publishers", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.Address).HasMaxLength(256);
            b.Property(x => x.PhoneNumber).HasMaxLength(32);
        });

        // 4. Cấu hình bảng Giỏ Hàng (Cart & CartItem)
        builder.Entity<Cart>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Carts", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.CartId).IsRequired();
        });

        builder.Entity<CartItem>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "CartItems", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId);
        });

        // 5. Cấu hình bảng Đơn Hàng (Order & OrderItem)
        builder.Entity<Order>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Orders", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.OrderNo).IsRequired().HasMaxLength(64);
            b.Property(x => x.ReceiverName).IsRequired().HasMaxLength(64);
            b.Property(x => x.ReceiverPhone).IsRequired().HasMaxLength(16);
            b.Property(x => x.ShippingAddress).IsRequired().HasMaxLength(256);

            b.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.OrderId).IsRequired();
        });

        builder.Entity<OrderItem>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "OrderItems", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId);
        });
        builder.Entity<BookReview>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "BookReviews", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Comment).IsRequired().HasMaxLength(1000);
            b.Property(x => x.UserName).HasMaxLength(128);
        });
        builder.Entity<WishlistItem>(b =>
        {       
            b.ToTable(BookStoreConsts.DbTablePrefix + "WishlistItems", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.HasIndex(x => new { x.UserId, x.BookId }).IsUnique(); // 1 user chỉ thả tim 1 sách 1 lần
        });
        builder.Entity<AppNotification>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Notifications", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Title).IsRequired().HasMaxLength(256);
            b.Property(x => x.Message).IsRequired().HasMaxLength(1000);
        });
        builder.Entity<Category>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Categories", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            b.Property(x => x.Description).HasMaxLength(512);
        });
        builder.Entity<ChatMessage>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "ChatMessages", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
        });

        // 13. Cấu hình bảng Mã Giảm Giá (Coupons)
        builder.Entity<Coupon>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "Coupons", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Code).IsRequired().HasMaxLength(50);
            b.HasIndex(x => x.Code).IsUnique();
            b.Property(x => x.Title).IsRequired().HasMaxLength(256);
            b.Property(x => x.DiscountValue).HasPrecision(18, 2);
            b.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
            b.Property(x => x.MinOrderAmount).HasPrecision(18, 2);
        });

        // 14. Cấu hình bảng Lịch sử sử dụng Coupon (CouponUsages)
        builder.Entity<CouponUsage>(b =>
        {
            b.ToTable(BookStoreConsts.DbTablePrefix + "CouponUsages", BookStoreConsts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            b.HasIndex(x => new { x.CouponId, x.UserId });
        });






         


        /* Configure your own tables/entities inside here */

        //builder.Entity<YourEntity>(b =>
        //{
        //    b.ToTable(BookStoreConsts.DbTablePrefix + "YourEntities", BookStoreConsts.DbSchema);
        //    b.ConfigureByConvention(); //auto configure for the base class props
        //    //...
        //});
    }
}
