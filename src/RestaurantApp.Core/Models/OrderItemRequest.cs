namespace RestaurantApp.Core.Models;

public class OrderItemRequest
{
    public Guid MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Optional: captures individual item row calculations if needed
}