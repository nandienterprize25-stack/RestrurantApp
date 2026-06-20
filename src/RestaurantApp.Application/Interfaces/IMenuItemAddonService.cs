using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Interfaces
{
    public interface IMenuItemAddonService
    {
        Task<IEnumerable<MenuItemAddonDto>> GetAllMappingsAsync();
        Task<bool> AssignAddonsToItemAsync(CreateMenuItemAddonDto dto);
        Task<bool> DeleteMappingAsync(Guid id);
    }
}