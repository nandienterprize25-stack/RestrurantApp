using System;
using System.Collections.Generic;

namespace RestaurantApp.Core.Entities
{
    public class TableArea
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string AreaName { get; set; } = string.Empty; // e.g., "Main Hall", "Rooftop Garden", "VIP Lounge"
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // Navigation property tracking internal tables mapped to this zone
        public virtual ICollection<RestaurantTable> Tables { get; set; } = new List<RestaurantTable>();
    }
}