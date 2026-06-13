using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantApp.Core.Entities
{
    public class GroupItemChild
    {
       public Guid Id { get; set; } = Guid.NewGuid();

        // The parent combo menu item (e.g., "Super Value Combo Meal")
        public Guid ParentMenuItemId { get; set; }
        public virtual MenuItem ParentMenuItem { get; set; } = null!;

        // The single item mapped inside that combo (e.g., "Regular French Fries")
        public Guid ChildMenuItemId { get; set; }
        public virtual MenuItem ChildMenuItem { get; set; } = null!;

        public int Quantity { get; set; } = 1;
    }
}