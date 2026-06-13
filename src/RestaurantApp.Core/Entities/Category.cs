namespace RestaurantApp.Core.Entities
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        
        private string _imageUrl = string.Empty;
        public string ImageUrl 
        { 
            get => string.IsNullOrEmpty(_imageUrl) ? "https://via.placeholder.com/60" : _imageUrl; 
            set => _imageUrl = value; 
        }
        
        public bool IsActive { get; set; } = true;
        public bool IsOffer { get; set; } = false; // 👈 New Blueprint Property Field Added!

        public Guid? ParentCategoryId { get; set; }
        public virtual Category? ParentCategory { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();
        public virtual ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }
}