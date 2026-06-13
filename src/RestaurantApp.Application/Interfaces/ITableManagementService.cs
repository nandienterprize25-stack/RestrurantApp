using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Interfaces
{
    public interface ITableManagementService
    {
        // Layout Area Scopes
        Task<IEnumerable<TableAreaDto>> GetAllAreasAsync(bool includeInactive = false);
        Task<TableAreaDto> CreateAreaAsync(CreateTableAreaDto dto);

        // Core Tables Operations Scopes
        Task<IEnumerable<RestaurantTableDto>> GetAllTablesAsync(bool includeInactive = false, Guid? areaId = null);
        Task<RestaurantTableDto?> GetTableByIdAsync(Guid id);
        Task<RestaurantTableDto> CreateTableAsync(CreateRestaurantTableDto dto);
        Task<bool> UpdateTableAsync(Guid id, UpdateRestaurantTableDto dto);
        Task<bool> DeleteTableAsync(Guid id);
    }
}