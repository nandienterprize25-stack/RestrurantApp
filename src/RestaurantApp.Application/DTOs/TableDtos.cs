using System;

namespace RestaurantApp.Application.DTOs
{
    public class TableAreaDto
    {
        public Guid Id { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int TotalTablesCount { get; set; }
    }

    public class CreateTableAreaDto
    {
        public string AreaName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class RestaurantTableDto
    {
        public Guid Id { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public Guid TableAreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
    }

    public class CreateRestaurantTableDto
    {
        public string TableNumber { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public Guid TableAreaId { get; set; }
    }

    public class UpdateRestaurantTableDto
    {
        public string TableNumber { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public Guid TableAreaId { get; set; }
    }
}