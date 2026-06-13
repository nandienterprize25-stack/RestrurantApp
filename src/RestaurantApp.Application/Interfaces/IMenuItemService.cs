using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Interfaces
{
    public interface IMenuItemService
    {
        Task<IEnumerable<MenuItemDto>> GetAllMenuItemsAsync(bool includeInactive = false, Guid? categoryId = null);
        Task<MenuItemDto?> GetMenuItemByIdAsync(Guid id);
        Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemDto dto);
        Task<bool> UpdateMenuItemAsync(Guid id, UpdateMenuItemDto dto);
        Task<bool> DeleteMenuItemAsync(Guid id);
    }
}