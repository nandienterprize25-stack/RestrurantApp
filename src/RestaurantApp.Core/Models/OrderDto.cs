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
}