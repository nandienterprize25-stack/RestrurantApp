using System;
using System.Collections.Generic;

namespace RestaurantApp.Core.Entities
{
    public class FoodVariant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // This links directly to the Base Food Item
        public Guid FoodItemId { get; set; }
        
        // Navigation Property used by EF Core
        public virtual MenuItem MenuItem { get; set; } = null!;

        public string VariantName { get; set; } = string.Empty; // maps to 'name' on your frontend
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; } = 0.00m;

        // 👇 Missing Fields Added to Persist Data permanently
        public string DietaryType { get; set; } = "Veg"; // e.g., "Veg", "Non-Veg"
        public string SpiceLevel { get; set; } = "Medium"; // e.g., "None", "Medium", "High", "Extra Hot"
        public bool IsActive { get; set; } = true;

        // Comma-separated or serialized values to store selected allergen strings seamlessly
        public string Allergens { get; set; } = string.Empty; // e.g., "soyabean,sesame"
    }
}