namespace RestaurantApp.Core.Models;

public class CreateOrderRequest
{
    public Guid? TableId { get; set; }
    public IList<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
}
