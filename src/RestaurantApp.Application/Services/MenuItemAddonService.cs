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
    public class MenuItemAddonService : IMenuItemAddonService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MenuItemAddonService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<MenuItemAddonDto>> GetAllMappingsAsync()
        {
            var mappings = await _unitOfWork.MenuItemAddons.GetAllAsync();
            
            return mappings.Select(m => new MenuItemAddonDto
            {
                Id = m.Id,
                MenuItemId = m.MenuItemId,
                AddonId = m.AddonId,
                MinSelectionsRequired = m.MinSelectionsRequired,
                MaxChoicesAllowed = m.MaxChoicesAllowed,
                IsMandatory = m.IsMandatory
            }).ToList();
        }

        public async Task<bool> AssignAddonsToItemAsync(CreateMenuItemAddonDto dto)
        {
            if (dto == null || dto.MenuItemId == Guid.Empty) return false;

            // 1. Fetch and wipe existing mappings for this specific food item to refresh assignments
            var existingLinks = await _unitOfWork.MenuItemAddons.GetAllAsync(filter: x => x.MenuItemId == dto.MenuItemId);
            foreach (var link in existingLinks)
            {
                _unitOfWork.MenuItemAddons.Remove(link);
            }

            // 2. Insert new item modifier assignments containing selection limits
            foreach (var addonId in dto.AddonIds)
            {
                var mapping = new MenuItemAddon
                {
                    MenuItemId = dto.MenuItemId,
                    AddonId = addonId,
                    MinSelectionsRequired = dto.MinSelectionsRequired,
                    MaxChoicesAllowed = dto.MaxChoicesAllowed,
                    IsMandatory = dto.IsMandatory
                };
                await _unitOfWork.MenuItemAddons.AddAsync(mapping);
            }

            // 3. Commit changes tracking node via Unit of Work pattern execution
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteMappingAsync(Guid id)
        {
            var links = await _unitOfWork.MenuItemAddons.GetAllAsync(filter: m => m.Id == id);
            var item = links.FirstOrDefault();
            if (item == null) return false;

            _unitOfWork.MenuItemAddons.Remove(item);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}