namespace RestaurantApp.Core.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public ICollection<MenuItem>? MenuItems { get; set; }
}
