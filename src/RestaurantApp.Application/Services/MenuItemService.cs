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
    public class MenuItemService : IMenuItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MenuItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<IEnumerable<MenuItemDto>> GetAllMenuItemsAsync(bool includeInactive = false, Guid? categoryId = null)
        {
            // 1. Fetch the data list into memory using your repository infrastructure
            var itemsList = await _unitOfWork.MenuItems.GetAllAsync(
                filter: null,
                includes: new System.Linq.Expressions.Expression<Func<MenuItem, object>>[]
                {
            m => m.Category,
            m => m.Variants,
            m => m.Availabilities,
            m => m.GroupComponents
                }
            );

            var query = itemsList.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(m => m.IsActive);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            // Create a dictionary map for quick child name lookups
            var allItemsMap = itemsList.ToDictionary(k => k.Id, v => v.Name);

            // 2. FIXED: Project on the evaluated List collection to bypass database provider Expression Tree parsing limits
            return query.AsEnumerable().Select(m => new MenuItemDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                ImageUrl = m.ImageUrl,
                IsActive = m.IsActive,
                IsGroupItem = m.IsGroupItem,
                CategoryId = m.CategoryId,
                CategoryName = m.Category != null ? m.Category.Name : "Unknown Category",
                Variants = m.Variants.Select(v => new FoodVariantDto
                {
                    Id = v.Id,
                    VariantName = v.VariantName,
                    Price = v.Price,
                    TaxPercentage = v.TaxPercentage
                }).ToList(),
                Availabilities = m.Availabilities.Select(a => new FoodAvailabilityDto
                {
                    Id = a.Id,
                    AvailableFrom = a.AvailableFrom,
                    AvailableTo = a.AvailableTo,
                    IsAvailableAllDay = a.IsAvailableAllDay
                }).ToList(),
                GroupComponents = m.GroupComponents.Select(g => new GroupItemChildDto
                {
                    Id = g.Id,
                    ChildMenuItemId = g.ChildMenuItemId,
                    // Safe inline lookup now that we're projecting over objects in memory
                    ChildMenuItemName = allItemsMap.TryGetValue(g.ChildMenuItemId, out var name) ? name : "Unknown Item",
                    Quantity = g.Quantity
                }).ToList()
            }).ToList();
        }

        public async Task<MenuItemDto?> GetMenuItemByIdAsync(Guid id)
        {
            // Get master list with fully populated layout maps using specific singular match filters
            var menuItems = await _unitOfWork.MenuItems.GetAllAsync(filter: m => m.Id == id,
                m => m.Category, m => m.Variants, m => m.Availabilities, m => m.GroupComponents);

            var m = menuItems.FirstOrDefault();
            if (m == null) return null;

            // Fetch master names map securely
            var masterList = await _unitOfWork.MenuItems.GetAllAsync();
            var allItemsMap = masterList.ToDictionary(k => k.Id, v => v.Name);

            return new MenuItemDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                ImageUrl = m.ImageUrl,
                IsActive = m.IsActive,
                IsGroupItem = m.IsGroupItem,
                CategoryId = m.CategoryId,
                CategoryName = m.Category != null ? m.Category.Name : "Unknown Category",
                Variants = m.Variants.Select(v => new FoodVariantDto
                {
                    Id = v.Id,
                    VariantName = v.VariantName,
                    Price = v.Price,
                    TaxPercentage = v.TaxPercentage
                }).ToList(),
                Availabilities = m.Availabilities.Select(a => new FoodAvailabilityDto
                {
                    Id = a.Id,
                    AvailableFrom = a.AvailableFrom,
                    AvailableTo = a.AvailableTo,
                    IsAvailableAllDay = a.IsAvailableAllDay
                }).ToList(),
                GroupComponents = m.GroupComponents.Select(g => new GroupItemChildDto
                {
                    Id = g.Id,
                    ChildMenuItemId = g.ChildMenuItemId,
                    ChildMenuItemName = allItemsMap.TryGetValue(g.ChildMenuItemId, out var name) ? name : "Unknown Item",
                    Quantity = g.Quantity
                }).ToList()
            };
        }
        public async Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemDto dto)
        {
            var item = new MenuItem
            {
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                IsGroupItem = dto.IsGroupItem,
                IsActive = true
            };

            // Map and add Variant options safely
            foreach (var v in dto.Variants)
            {
                item.Variants.Add(new FoodVariant
                {
                    VariantName = v.VariantName,
                    Price = v.Price,
                    TaxPercentage = v.TaxPercentage
                });
            }

            // Map scheduling rules
            foreach (var a in dto.Availabilities)
            {
                item.Availabilities.Add(new FoodAvailability
                {
                    AvailableFrom = a.AvailableFrom,
                    AvailableTo = a.AvailableTo,
                    IsAvailableAllDay = a.IsAvailableAllDay
                });
            }

            // Map Combo properties if flags match
            if (dto.IsGroupItem)
            {
                foreach (var g in dto.GroupComponents)
                {
                    item.GroupComponents.Add(new GroupItemChild
                    {
                        ChildMenuItemId = g.ChildMenuItemId,
                        Quantity = g.Quantity
                    });
                }
            }

            await _unitOfWork.MenuItems.AddAsync(item);
            await _unitOfWork.CompleteAsync();

            return (await GetMenuItemByIdAsync(item.Id))!;
        }

        public async Task<bool> UpdateMenuItemAsync(Guid id, UpdateMenuItemDto dto)
        {
            // Fetch layout record via EF tracked state to rewrite sub-collections smoothly
            var items = await _unitOfWork.MenuItems.GetAllAsync(filter: m => m.Id == id,
                m => m.Variants, m => m.Availabilities, m => m.GroupComponents);

            var item = items.FirstOrDefault();
            if (item == null) return false;

            item.Name = dto.Name;
            item.Description = dto.Description;
            item.ImageUrl = dto.ImageUrl;
            item.CategoryId = dto.CategoryId;
            item.IsActive = dto.IsActive;
            item.IsGroupItem = dto.IsGroupItem;

            // Simple Collection Refresh: Clear and rebuild related items
            item.Variants.Clear();
            foreach (var v in dto.Variants)
            {
                item.Variants.Add(new FoodVariant { VariantName = v.VariantName, Price = v.Price, TaxPercentage = v.TaxPercentage });
            }

            item.Availabilities.Clear();
            foreach (var a in dto.Availabilities)
            {
                item.Availabilities.Add(new FoodAvailability { AvailableFrom = a.AvailableFrom, AvailableTo = a.AvailableTo, IsAvailableAllDay = a.IsAvailableAllDay });
            }

            item.GroupComponents.Clear();
            if (dto.IsGroupItem)
            {
                foreach (var g in dto.GroupComponents)
                {
                    item.GroupComponents.Add(new GroupItemChild { ChildMenuItemId = g.ChildMenuItemId, Quantity = g.Quantity });
                }
            }

            _unitOfWork.MenuItems.Update(item);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteMenuItemAsync(Guid id)
        {
            var menuItems = await _unitOfWork.MenuItems.GetAllAsync(filter: m => m.Id == id);
            var item = menuItems.FirstOrDefault();
            if (item == null) return false;

            _unitOfWork.MenuItems.Remove(item);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}