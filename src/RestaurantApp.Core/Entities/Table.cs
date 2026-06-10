namespace RestaurantApp.Core.Entities;

public enum TableStatus
{
    Available,
    Occupied,
    Reserved
}

public class Table
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Number { get; set; }
    public int Capacity { get; set; }
    public TableStatus Status { get; set; } = TableStatus.Available;
}
