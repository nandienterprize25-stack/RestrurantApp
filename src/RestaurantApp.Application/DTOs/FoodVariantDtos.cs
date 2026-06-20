using System;
using System.Collections.Generic;

namespace RestaurantApp.Application.DTOs
{
    public class FoodVariantDto
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal TaxPercentage { get; set; } = 0.00m;
        public decimal Price { get; set; }
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }

    public class CreateFoodVariantDto
    {
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; } = 0.00m;
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }

    public class UpdateFoodVariantDto
    {
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }
}