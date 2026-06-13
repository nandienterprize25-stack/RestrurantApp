using System;

namespace RestaurantApp.Core.Entities
{
    public class RestaurantTable
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TableNumber { get; set; } = string.Empty; // e.g., "Table-01", "T-14"
        public int SeatingCapacity { get; set; } = 2;
        public string Status { get; set; } = "Available"; // Available, Occupied, Reserved, OutOfOrder
        public bool IsActive { get; set; } = true;

        // Foreign Key link mapping down to the layout space placement area
        public Guid TableAreaId { get; set; }
        public virtual TableArea TableArea { get; set; } = null!;
    }
}