namespace Acme.BookStore.Payments;

public class PaymentResultDto
{
    public bool Success { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
