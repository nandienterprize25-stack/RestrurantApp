using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;

namespace RestaurantApp.Application.Services
{
    public class FoodVariantService : IFoodVariantService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FoodVariantService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<FoodVariantDto>> GetAllVariantsAsync()
        {
            // Leverages your standard architecture base query logic
            var variantsList = await _unitOfWork.FoodVariants.GetAllAsync();

            return variantsList.Select(v => new FoodVariantDto
            {
                Id = v.Id,
                MenuItemId = v.FoodItemId,
                Name = v.VariantName,
                Price = v.Price,
                DietaryType = string.IsNullOrEmpty(v.DietaryType) ? "Veg" : v.DietaryType,
                SpiceLevel = string.IsNullOrEmpty(v.SpiceLevel) ? "Medium" : v.SpiceLevel,
                IsActive = v.IsActive,
                AllergenList = !string.IsNullOrEmpty(v.Allergens) 
                    ? v.Allergens.Split(',').ToList() 
                    : new List<string>()
            });
        }

        public async Task<FoodVariantDto?> GetVariantByIdAsync(Guid id)
        {
            var variants = await _unitOfWork.FoodVariants.GetAllAsync(filter: v => v.Id == id);
            var v = variants.FirstOrDefault();
            if (v == null) return null;

            return new FoodVariantDto
            {
                Id = v.Id,
                MenuItemId = v.FoodItemId,
                Name = v.VariantName,
                Price = v.Price,
                DietaryType = v.DietaryType,
                SpiceLevel = v.SpiceLevel,
                IsActive = v.IsActive,
                AllergenList = !string.IsNullOrEmpty(v.Allergens) 
                    ? v.Allergens.Split(',').ToList() 
                    : new List<string>()
            };
        }

        public async Task<FoodVariantDto> CreateVariantAsync(CreateFoodVariantDto dto)
        {
            var newVariant = new FoodVariant
            {
                Id = Guid.NewGuid(),
                FoodItemId = dto.MenuItemId,
                VariantName = dto.Name,
                Price = dto.Price,
                DietaryType = dto.DietaryType ?? "Veg",
                SpiceLevel = dto.SpiceLevel ?? "Medium",
                IsActive = dto.IsActive,
                Allergens = dto.AllergenList != null ? string.Join(",", dto.AllergenList) : string.Empty
            };

            await _unitOfWork.FoodVariants.AddAsync(newVariant);
            await _unitOfWork.CompleteAsync();

            return new FoodVariantDto
            {
                Id = newVariant.Id,
                MenuItemId = newVariant.FoodItemId,
                Name = newVariant.VariantName,
                Price = newVariant.Price,
                DietaryType = newVariant.DietaryType,
                SpiceLevel = newVariant.SpiceLevel,
                IsActive = newVariant.IsActive,
                AllergenList = dto.AllergenList ?? new List<string>()
            };
        }

        public async Task<bool> UpdateVariantAsync(Guid id, UpdateFoodVariantDto dto)
        {
            var variants = await _unitOfWork.FoodVariants.GetAllAsync(filter: v => v.Id == id);
            var variant = variants.FirstOrDefault();
            if (variant == null) return false;

            variant.FoodItemId = dto.MenuItemId;
            variant.VariantName = dto.Name;
            variant.Price = dto.Price;
            variant.DietaryType = dto.DietaryType ?? "Veg";
            variant.SpiceLevel = dto.SpiceLevel ?? "Medium";
            variant.IsActive = dto.IsActive;
            variant.Allergens = dto.AllergenList != null ? string.Join(",", dto.AllergenList) : string.Empty;

            _unitOfWork.FoodVariants.Update(variant);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteVariantAsync(Guid id)
        {
            var variants = await _unitOfWork.FoodVariants.GetAllAsync(filter: v => v.Id == id);
            var variant = variants.FirstOrDefault();
            if (variant == null) return false;

            _unitOfWork.FoodVariants.Remove(variant);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}