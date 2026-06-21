using RestaurantApp.Core.Entities;

namespace RestaurantApp.Api.Models;

public class OrderResponse
{
    public Guid Id { get; set; }

    public string InvoiceNo { get; set; } = string.Empty; // Auto-generated string key: e.g., "INV-2026-0001"
    public Guid? TableId { get; set; }
    public string WaiterName { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;

    //
       public string OrderStatus { get; set; } = string.Empty;
        public string PaymentMode { get; set; } =string.Empty;
        public string PaymentStatus { get; set; } =string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedById { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    //

    public decimal CashPaid { get; set; }
    public decimal CardPaid { get; set; }
    public decimal UpiPaid { get; set; }

    public string TableNumber { get; set; } = string.Empty; // 👈 Fixed initialization

    public string TableName { get; set; } = string.Empty; // 👈 Fixed initialization

    public string CreatedByUsername { get; set; } = null!;

    public string Status { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public IReadOnlyList<OrderItemResponse> Items { get; set; } = Array.Empty<OrderItemResponse>();
}