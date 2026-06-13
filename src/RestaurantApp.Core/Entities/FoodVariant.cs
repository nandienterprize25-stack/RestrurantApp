using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantApp.Core.Entities
{
    public class FoodVariant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FoodItemId { get; set; }
        public virtual MenuItem MenuItem { get; set; } = null!;

        public string VariantName { get; set; } = string.Empty; // e.g., "Regular", "Large", "Full Hand"
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; } = 0.00m;
    }
}