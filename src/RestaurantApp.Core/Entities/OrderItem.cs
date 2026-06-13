using System;

namespace RestaurantApp.Core.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        public Guid MenuItemId { get; set; }
        public string ItemName { get; set; } = string.Empty; // Snapshot to lock item description on purchase date
        public string VariantName { get; set; } = string.Empty; // e.g., "Regular", "Large"
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal TotalPrice { get; set; }
    }
}


// namespace RestaurantApp.Core.Entities;

// public class OrderItem
// {
//     public Guid Id { get; set; } = Guid.NewGuid();
//     public Guid OrderId { get; set; }
//     public Order? Order { get; set; }
//     public Guid MenuItemId { get; set; }
//     public MenuItem? MenuItem { get; set; }
//     public int Quantity { get; set; }
//     public decimal UnitPrice { get; set; }
// }
