using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Acme.BookStore.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.Coupons;

/// <summary>
/// Service xử lý nghiệp vụ Quản lý & Áp dụng Mã giảm giá (Coupons & Promotions).
/// TUÂN THỦ HIẾN PHÁP: Kế thừa ApplicationService, thực thi ICouponAppService (Không dùng CrudAppService).
/// </summary>
public class CouponAppService : ApplicationService, ICouponAppService
{
    private readonly IRepository<Coupon, Guid> _couponRepository;
    private readonly IRepository<CouponUsage, Guid> _usageRepository;

    public CouponAppService(
        IRepository<Coupon, Guid> couponRepository,
        IRepository<CouponUsage, Guid> usageRepository)
    {
        _couponRepository = couponRepository;
        _usageRepository = usageRepository;
    }

    public async Task<CouponDto> GetAsync(Guid id)
    {
        var coupon = await _couponRepository.GetAsync(id);
        return ObjectMapper.Map<Coupon, CouponDto>(coupon);
    }

    public async Task<PagedResultDto<CouponDto>> GetListAsync(GetCouponListDto input)
    {
        var queryable = await _couponRepository.GetQueryableAsync();

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var filter = input.Filter.Trim().ToLower();
            queryable = queryable.Where(x => x.Code.ToLower().Contains(filter) || x.Title.ToLower().Contains(filter));
        }

        if (input.IsActive.HasValue)
        {
            queryable = queryable.Where(x => x.IsActive == input.IsActive.Value);
        }

        var totalCount = await AsyncExecuter.CountAsync(queryable);

        var items = await AsyncExecuter.ToListAsync(
            queryable
                .OrderByDescending(x => x.CreationTime)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
        );

        return new PagedResultDto<CouponDto>(
            totalCount,
            ObjectMapper.Map<List<Coupon>, List<CouponDto>>(items)
        );
    }

    public async Task<CouponDto> CreateAsync(CreateUpdateCouponDto input)
    {
        var code = input.Code.Trim().ToUpperInvariant();
        if (await _couponRepository.AnyAsync(x => x.Code == code))
        {
            throw new UserFriendlyException($"Mã giảm giá '{code}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác!");
        }

        if (input.StartDate > input.EndDate)
        {
            throw new UserFriendlyException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        var coupon = new Coupon(
            GuidGenerator.Create(),
            code,
            input.Title,
            input.DiscountType,
            input.DiscountValue,
            input.MaxDiscountAmount,
            input.MinOrderAmount,
            input.MaxUsageCount,
            input.StartDate,
            input.EndDate,
            input.IsActive
        );

        await _couponRepository.InsertAsync(coupon, autoSave: true);
        return ObjectMapper.Map<Coupon, CouponDto>(coupon);
    }

    public async Task<CouponDto> UpdateAsync(Guid id, CreateUpdateCouponDto input)
    {
        var coupon = await _couponRepository.GetAsync(id);

        var code = input.Code.Trim().ToUpperInvariant();
        if (coupon.Code != code && await _couponRepository.AnyAsync(x => x.Code == code))
        {
            throw new UserFriendlyException($"Mã giảm giá '{code}' đã tồn tại trong hệ thống.");
        }

        if (input.StartDate > input.EndDate)
        {
            throw new UserFriendlyException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
        }

        coupon.Code = code;
        coupon.Title = input.Title;
        coupon.DiscountType = input.DiscountType;
        coupon.DiscountValue = input.DiscountValue;
        coupon.MaxDiscountAmount = input.MaxDiscountAmount;
        coupon.MinOrderAmount = input.MinOrderAmount;
        coupon.MaxUsageCount = input.MaxUsageCount;
        coupon.StartDate = input.StartDate;
        coupon.EndDate = input.EndDate;
        coupon.IsActive = input.IsActive;

        await _couponRepository.UpdateAsync(coupon, autoSave: true);
        return ObjectMapper.Map<Coupon, CouponDto>(coupon);
    }

    public async Task DeleteAsync(Guid id)
    {
        var hasUsage = await _usageRepository.AnyAsync(x => x.CouponId == id);
        if (hasUsage)
        {
            throw new UserFriendlyException("Không thể xóa mã giảm giá này vì đã có đơn hàng sử dụng. Bạn có thể chuyển sang trạng thái Tắt kích hoạt!");
        }

        await _couponRepository.DeleteAsync(id);
    }

    public async Task ToggleActiveAsync(Guid id)
    {
        var coupon = await _couponRepository.GetAsync(id);
        coupon.IsActive = !coupon.IsActive;
        await _couponRepository.UpdateAsync(coupon, autoSave: true);
    }

    /// <summary>
    /// Kiểm tra tính hợp lệ và tính số tiền giảm giá realtime cho Khách hàng
    /// </summary>
    public async Task<CouponValidationResultDto> ValidateCouponAsync(ValidateCouponInputDto input)
    {
        var code = input.Code?.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(code))
        {
            return CouponValidationResultDto.Fail("Vui lòng nhập mã giảm giá.");
        }

        var coupon = await _couponRepository.FirstOrDefaultAsync(x => x.Code == code);
        if (coupon == null)
        {
            return CouponValidationResultDto.Fail($"Mã giảm giá '{code}' không tồn tại.");
        }

        if (!coupon.IsActive)
        {
            return CouponValidationResultDto.Fail("Mã giảm giá này hiện đang tạm ngưng áp dụng.");
        }

        var now = Clock.Now;
        if (now < coupon.StartDate)
        {
            return CouponValidationResultDto.Fail($"Chương trình giảm giá chưa bắt đầu (bắt đầu từ {coupon.StartDate:dd/MM/yyyy}).");
        }

        if (now > coupon.EndDate)
        {
            return CouponValidationResultDto.Fail($"Mã giảm giá đã hết hạn sử dụng vào ngày {coupon.EndDate:dd/MM/yyyy}.");
        }

        if (coupon.UsedCount >= coupon.MaxUsageCount)
        {
            return CouponValidationResultDto.Fail("Mã giảm giá đã hết lượt sử dụng.");
        }

        if (input.OrderTotal < coupon.MinOrderAmount)
        {
            return CouponValidationResultDto.Fail($"Đơn hàng cần đạt tối thiểu {coupon.MinOrderAmount:N0}₫ để áp dụng mã này (Hiện tại: {input.OrderTotal:N0}₫).");
        }

        // Kiểm tra per-user limit nếu đã đăng nhập
        if (CurrentUser.IsAuthenticated && CurrentUser.Id.HasValue)
        {
            var alreadyUsed = await _usageRepository.AnyAsync(x => x.CouponId == coupon.Id && x.UserId == CurrentUser.Id.Value);
            if (alreadyUsed)
            {
                return CouponValidationResultDto.Fail("Bạn đã sử dụng mã giảm giá này rồi (mỗi tài khoản chỉ được dùng 1 lần).");
            }
        }

        // Tính toán chiết khấu
        decimal discount = 0;
        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discount = Math.Round(input.OrderTotal * (coupon.DiscountValue / 100m));
            if (coupon.MaxDiscountAmount.HasValue && coupon.MaxDiscountAmount.Value > 0)
            {
                discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
            }
        }
        else
        {
            discount = coupon.DiscountValue;
        }

        // Không bao giờ giảm vượt quá tổng tiền hàng
        discount = Math.Min(discount, input.OrderTotal);
        var finalTotal = Math.Max(0, input.OrderTotal - discount);

        return CouponValidationResultDto.Success(coupon.Id, coupon.Code, coupon.Title, discount, finalTotal);
    }
}
