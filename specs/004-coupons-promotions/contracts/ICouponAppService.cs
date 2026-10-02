using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Coupons;

/// <summary>
/// Interface Service quản lý Mã giảm giá.
/// TUÂN THỦ HIẾN PHÁP DỰ ÁN: Kế thừa trực tiếp IApplicationService, KHÔNG dùng ICrudAppService<...>
/// </summary>
public interface ICouponAppService : IApplicationService
{
    // 1. Lấy chi tiết 1 mã
    Task<CouponDto> GetAsync(Guid id);

    // 2. Lấy danh sách phân trang (Admin)
    Task<PagedResultDto<CouponDto>> GetListAsync(GetCouponListDto input);

    // 3. Tạo mới mã giảm giá (Admin)
    Task<CouponDto> CreateAsync(CreateUpdateCouponDto input);

    // 4. Cập nhật mã giảm giá (Admin)
    Task<CouponDto> UpdateAsync(Guid id, CreateUpdateCouponDto input);

    // 5. Xóa mã giảm giá (Admin)
    Task DeleteAsync(Guid id);

    // 6. Bật / Tắt trạng thái kích hoạt (Admin)
    Task ToggleActiveAsync(Guid id);

    // 7. Khách hàng kiểm tra và áp dụng mã giảm giá (Storefront)
    Task<CouponValidationResultDto> ValidateCouponAsync(ValidateCouponInputDto input);
}

public class GetCouponListDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
    public bool? IsActive { get; set; }
}

public class CreateUpdateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; } = DiscountType.Percentage;
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int MaxUsageCount { get; set; } = 100;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(30);
    public bool IsActive { get; set; } = true;
}

public class CouponDto : FullAuditedEntityDto<Guid>
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int MaxUsageCount { get; set; }
    public int UsedCount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class ValidateCouponInputDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderTotal { get; set; }
}

public class CouponValidationResultDto
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public Guid? CouponId { get; set; }
    public string? Code { get; set; }
    public string? Title { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalTotal { get; set; }

    public static CouponValidationResultDto Fail(string message) => new()
    {
        IsValid = false,
        ErrorMessage = message
    };

    public static CouponValidationResultDto Success(Guid couponId, string code, string title, decimal discount, decimal finalTotal) => new()
    {
        IsValid = true,
        CouponId = couponId,
        Code = code,
        Title = title,
        DiscountAmount = discount,
        FinalTotal = finalTotal
    };
}
