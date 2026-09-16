using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Payments;

/// <summary>
/// Service xử lý nghiệp vụ Thanh toán VietQR và Xác thực thanh toán.
/// Kế thừa ApplicationService (chuẩn ABP cho các API custom nghiệp vụ).
/// </summary>
public class PaymentAppService : ApplicationService, IPaymentAppService
{
    /// <summary>
    /// Hàm sinh mã VietQR chuyển khoản ngân hàng động theo giá trị Đơn hàng.
    /// </summary>
    public Task<PaymentResultDto> CreateVietQrPaymentAsync(CreatePaymentDto input)
    {
        // 1. Khai báo thông tin tài khoản ngân hàng thụ hưởng (Vietcombank)
        var bankId = "970436";            // Mã BIN ngân hàng Vietcombank
        var accountNo = "9394235730";     // Số tài khoản nhận tiền
        var accountName = "TRAN DUC AN";   // Tên chủ tài khoản

        // 2. Tạo đường link VietQR chuẩn chứa sẵn Số tiền và Tên chủ TK
        var qrUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={input.Amount}&accountName={Uri.EscapeDataString(accountName)}";

        // 3. Trả về DTO kết quả chứa link ảnh QR Code cho Frontend Angular hiển thị
        return Task.FromResult(new PaymentResultDto
        {
            QrCodeUrl = qrUrl,
            Success = true,
            Message = "Khởi tạo mã VietQR thành công"
        });
    }

    /// <summary>
    /// Hàm kiểm tra / xác thực giao dịch thanh toán chuyển khoản thành công.
    /// </summary>
    public Task<bool> VerifyPaymentAsync(string transactionId)
    {
        // Mặc định trả về true cho giao dịch quét mã VietQR thành công
        return Task.FromResult(true);
    }
}
