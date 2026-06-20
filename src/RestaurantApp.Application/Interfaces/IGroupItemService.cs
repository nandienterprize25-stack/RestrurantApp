using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Interfaces
{
    public interface IGroupItemService
    {
        Task<IEnumerable<GroupItemChildDto>> GetGroupComponentsAsync(Guid parentId);
        Task<GroupItemChildDto> AddComponentToGroupAsync(CreateGroupItemChildDto dto);
        Task<bool> UpdateComponentQuantityAsync(Guid id, UpdateGroupItemChildDto dto);
        Task<bool> RemoveComponentFromGroupAsync(Guid id);
    }
}