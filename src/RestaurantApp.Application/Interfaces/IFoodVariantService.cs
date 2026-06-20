using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Interfaces
{
    public interface IFoodVariantService
    {
        Task<IEnumerable<FoodVariantDto>> GetAllVariantsAsync();
        Task<FoodVariantDto?> GetVariantByIdAsync(Guid id);
        Task<FoodVariantDto> CreateVariantAsync(CreateFoodVariantDto dto);
        Task<bool> UpdateVariantAsync(Guid id, UpdateFoodVariantDto dto);
        Task<bool> DeleteVariantAsync(Guid id);
    }
}