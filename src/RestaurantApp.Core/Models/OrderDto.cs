using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantApp.Core.Models
{
    public class PosOrderRequest
    {
        public string CustomerName { get; set; } = "Walk-In Customer";
        public string CustomerType { get; set; } = "Dine In"; // Dine In, Takeaway, Delivery
        public string? WaiterName { get; set; }
        public string? SelectedTable { get; set; } // e.g. "Table 04"
        public decimal Subtotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal VatAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public List<PosCartItemDto> Items { get; set; } = new();
    }

    public class PosCartItemDto
    {
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class CreateOrderItemDto
    {
        public Guid MenuItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string VariantName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxPercentage { get; set; }
    }

    public class CreateOrderDto
    {
        public Guid TableId { get; set; }
        public string WaiterName { get; set; } = string.Empty;
        public List<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
        public string PaymentMode { get; set; } = "Cash";
    }

    public class OrderResponseDto
    {
        public Guid Id { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public Guid? TableId { get; set; }
        public string TableNumber { get; set; } = string.Empty; // 👈 Changed from int to string
        public string WaiterName { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentMode { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public DateTime OrderDate { get; set; }
        public List<OrderItemResponseDto> OrderItems { get; set; } = new List<OrderItemResponseDto>();
    }

    public class OrderItemResponseDto
    {
        public Guid Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string VariantName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }


}