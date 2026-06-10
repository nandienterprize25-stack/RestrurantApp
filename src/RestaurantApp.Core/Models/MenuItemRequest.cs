namespace RestaurantApp.Core.Models;

public class MenuItemRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
}
