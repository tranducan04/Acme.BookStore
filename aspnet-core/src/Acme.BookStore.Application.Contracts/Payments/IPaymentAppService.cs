using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.Payments;

public interface IPaymentAppService : IApplicationService
{
    Task<PaymentResultDto> CreateVietQrPaymentAsync(CreatePaymentDto input);
    Task<bool> VerifyPaymentAsync(string transactionId);
}
