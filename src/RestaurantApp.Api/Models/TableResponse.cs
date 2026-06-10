namespace RestaurantApp.Api.Models;

public class TableResponse
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = null!;
}
