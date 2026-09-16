using System;

namespace Acme.BookStore.Payments;

public class CreatePaymentDto
{
    public Guid OrderId { get; set; }
    public double Amount { get; set; }
    public string PaymentMethod { get; set; } = "VietQR";
}
