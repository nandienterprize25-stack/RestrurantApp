namespace RestaurantApp.Api.Models;

public class OrderResponse
{
    public Guid Id { get; set; }
    public Guid? TableId { get; set; }
    public string TableNumber { get; set; } = string.Empty; // 👈 Fixed initialization
    public Guid CreatedById { get; set; }
    public string CreatedByUsername { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public IReadOnlyList<OrderItemResponse> Items { get; set; } = Array.Empty<OrderItemResponse>();
}