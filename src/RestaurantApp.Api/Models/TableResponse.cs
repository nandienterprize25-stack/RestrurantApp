namespace RestaurantApp.Api.Models;

public class TableResponse
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty; // 👈 Fixed initialization
    public int Capacity { get; set; }
    public string Status { get; set; } = null!;
}