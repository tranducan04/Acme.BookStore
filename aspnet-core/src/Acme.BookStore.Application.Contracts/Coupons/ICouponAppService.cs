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
