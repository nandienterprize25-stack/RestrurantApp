namespace RestaurantApp.Core.Models;

public class OrderItemRequest
{
    public Guid MenuItemId { get; set; }
    public int Quantity { get; set; }
}
