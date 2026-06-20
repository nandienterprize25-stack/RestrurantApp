namespace RestaurantApp.Core.Entities;

public class MenuItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public decimal Price { get; set; }

    // Combo / Package Check flag
    public bool IsGroupItem { get; set; } = false;

    // 🌟 ADD THESE TWO PROPERTIES HERE:
    public bool IsAddon { get; set; } = false;
    
    public string Notes { get; set; } = string.Empty;

    // Relationships
    public Guid CategoryId { get; set; }
    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<FoodVariant> Variants { get; set; } = new List<FoodVariant>();
    public virtual ICollection<FoodAvailability> Availabilities { get; set; } = new List<FoodAvailability>();

    // If this item is a combo pack, these are the child items inside it
    public virtual ICollection<GroupItemChild> GroupComponents { get; set; } = new List<GroupItemChild>();
}
