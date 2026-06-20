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
    public class GroupItemService : IGroupItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GroupItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<GroupItemChildDto>> GetGroupComponentsAsync(Guid parentId)
        {
            var menuItems = await _unitOfWork.MenuItems.GetAllAsync(
                filter: m => m.Id == parentId,
                includes: new System.Linq.Expressions.Expression<Func<MenuItem, object>>[] { m => m.GroupComponents }
            );
            
            var parentItem = menuItems.FirstOrDefault();
            if (parentItem == null) return Enumerable.Empty<GroupItemChildDto>();

            var allItems = await _unitOfWork.MenuItems.GetAllAsync();

            return parentItem.GroupComponents.Select(g => new GroupItemChildDto
            {
                Id = g.Id,
                ParentMenuItemId = g.ParentMenuItemId,
                ChildMenuItemId = g.ChildMenuItemId,
                ChildItemName = allItems.FirstOrDefault(x => x.Id == g.ChildMenuItemId)?.Name ?? "Unknown Item",
                Quantity = g.Quantity
            });
        }

        public async Task<GroupItemChildDto> AddComponentToGroupAsync(CreateGroupItemChildDto dto)
        {
            var entity = new GroupItemChild
            {
                Id = Guid.NewGuid(),
                ParentMenuItemId = dto.ParentMenuItemId,
                ChildMenuItemId = dto.ChildMenuItemId,
                Quantity = dto.Quantity
            };

            // Assuming GroupItemChildren is exposed via your Unit of Work repository schema
            await _unitOfWork.GroupItemChildren.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            var childItem = await _unitOfWork.MenuItems.GetByIdAsync(dto.ChildMenuItemId);

            return new GroupItemChildDto
            {
                Id = entity.Id,
                ParentMenuItemId = entity.ParentMenuItemId,
                ChildMenuItemId = entity.ChildMenuItemId,
                ChildItemName = childItem?.Name ?? "Unknown Item",
                Quantity = entity.Quantity
            };
        }

        public async Task<bool> UpdateComponentQuantityAsync(Guid id, UpdateGroupItemChildDto dto)
        {
            var entity = await _unitOfWork.GroupItemChildren.GetByIdAsync(id);
            if (entity == null) return false;

            entity.Quantity = dto.Quantity;
            entity.ChildMenuItemId = dto.ChildMenuItemId;

            _unitOfWork.GroupItemChildren.Update(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> RemoveComponentFromGroupAsync(Guid id)
        {
            var entity = await _unitOfWork.GroupItemChildren.GetByIdAsync(id);
            if (entity == null) return false;

            _unitOfWork.GroupItemChildren.Remove(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}