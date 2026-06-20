using System;
using System.Collections.Generic;

namespace RestaurantApp.Application.DTOs
{
    // --- MAIN DTOs ---
    public class MenuItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsGroupItem { get; set; }
        // 🌟 ADD THESE TWO PROPERTIES HERE:
        public bool IsAddon { get; set; } = false;

        public string Notes { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }

        public List<FoodVariantDto> Variants { get; set; } = new();
        public List<FoodAvailabilityDto> Availabilities { get; set; } = new();
        public List<GroupItemChildDto> GroupComponents { get; set; } = new();
    }

    public class CreateMenuItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public decimal Price { get; set; }
        public bool IsGroupItem { get; set; }
        // 🌟 ADD THESE TWO PROPERTIES HERE:
        public bool IsAddon { get; set; } = false;

        public string Notes { get; set; } = string.Empty;


        // Child payload options allowed during initialization
        public List<CreateFoodVariantDto> Variants { get; set; } = new();
        public List<CreateFoodAvailabilityDto> Availabilities { get; set; } = new();
        public List<CreateGroupItemChildDto> GroupComponents { get; set; } = new();
    }

    public class UpdateMenuItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public bool IsActive { get; set; }
        public bool IsGroupItem { get; set; }
        // 🌟 ADD THESE TWO PROPERTIES HERE:
        public bool IsAddon { get; set; } = false;

        public string Notes { get; set; } = string.Empty;


        public List<CreateFoodVariantDto> Variants { get; set; } = new();
        public List<CreateFoodAvailabilityDto> Availabilities { get; set; } = new();
        public List<CreateGroupItemChildDto> GroupComponents { get; set; } = new();
    }

    // // --- NESTED SUB-ELEMENT DTOs ---
    // public class FoodVariantDto
    // {
    //     public Guid Id { get; set; }
    //     public string VariantName { get; set; } = string.Empty;
    //     public decimal Price { get; set; }
    //     public decimal TaxPercentage { get; set; }
    // }

    // public class CreateFoodVariantDto
    // {
    //     public string VariantName { get; set; } = string.Empty;
    //     public decimal Price { get; set; }
    //     public decimal TaxPercentage { get; set; }
    // }

    public class FoodAvailabilityDto
    {
        public Guid Id { get; set; }
        public TimeSpan AvailableFrom { get; set; }
        public TimeSpan AvailableTo { get; set; }
        public bool IsAvailableAllDay { get; set; }
    }

    public class CreateFoodAvailabilityDto
    {
        public TimeSpan AvailableFrom { get; set; }
        public TimeSpan AvailableTo { get; set; }
        public bool IsAvailableAllDay { get; set; }
    }


}