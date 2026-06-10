namespace RestaurantApp.Core.Entities;

public enum OrderStatus
{
    New,
    InProgress,
    Completed,
    Cancelled
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TableId { get; set; }
    public Table? Table { get; set; }
    public Guid CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public decimal TotalAmount { get; set; }
    public ICollection<OrderItem>? Items { get; set; }
}
