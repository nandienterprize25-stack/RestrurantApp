using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantApp.Core.Entities
{
    public class FoodAvailability
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FoodItemId { get; set; }
        public virtual MenuItem MenuItem { get; set; } = null!;

        // Availability Windows
        public TimeSpan AvailableFrom { get; set; } // e.g., 07:00:00
        public TimeSpan AvailableTo { get; set; }   // e.g., 11:00:00
        public bool IsAvailableAllDay { get; set; } = true;
    }
}