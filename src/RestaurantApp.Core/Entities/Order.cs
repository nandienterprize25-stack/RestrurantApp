
using System;
using System.Collections.Generic;

namespace RestaurantApp.Core.Entities
{
    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string InvoiceNo { get; set; } = string.Empty; // Auto-generated string key: e.g., "INV-2026-0001"
        public Guid? TableId { get; set; }
        public string WaiterName { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;
        public string OrderType { get; set; } = string.Empty;


        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
        public PaymentMode PaymentMode { get; set; } = PaymentMode.Cash;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public decimal CashPaid { get; set; }
        public decimal CardPaid { get; set; }
        public decimal UpiPaid { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Navigation property collections
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}

// namespace RestaurantApp.Core.Entities;


// public class Order
// {
//     public Guid Id { get; set; } = Guid.NewGuid();
//     public Guid UserId { get; set; }
//     public Guid? TableId { get; set; }
//     public RestaurantTable? Table { get; set; }
//     public Guid CreatedById { get; set; }
//     public User? CreatedBy { get; set; }
//     public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//     public OrderStatus Status { get; set; } = OrderStatus.New;
//     public decimal TotalAmount { get; set; }
//     public ICollection<OrderItem>? Items { get; set; }
// }
