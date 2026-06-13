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
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(bool includeInactive = false)
        {
            var categoriesList = await _unitOfWork.Categories.GetAllAsync();
            var categories = categoriesList.AsEnumerable();

            if (!includeInactive)
            {
                categories = categories.Where(c => c.IsActive);
            }

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name.ToUpper(), // Force Uppercase formatting globally
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                IsOffer = c.IsOffer, // 👈 Added
                ParentCategoryId = c.ParentCategoryId,
                ParentCategoryName = c.ParentCategoryId.HasValue 
                    ? categoriesList.FirstOrDefault(p => p.Id == c.ParentCategoryId.Value)?.Name.ToUpper() 
                    : "CORE LEVEL"
            });
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name.ToUpper(),
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                IsOffer = category.IsOffer, // 👈 Added
                ParentCategoryId = category.ParentCategoryId
            };
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name.ToUpper(), // Standardize uppercase strings
                Description = dto.Description ?? string.Empty,
                ImageUrl = dto.ImageUrl,
                IsActive = true, // Force Active state by default on new setups
                IsOffer = dto.IsOffer, // 👈 Added
                ParentCategoryId = dto.ParentCategoryId
            };

            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                IsOffer = category.IsOffer,
                ParentCategoryId = category.ParentCategoryId
            };
        }

        public async Task<bool> UpdateCategoryAsync(Guid id, UpdateCategoryDto dto)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return false;

            category.Name = dto.Name.ToUpper();
            category.Description = dto.Description ?? string.Empty;
            category.ImageUrl = dto.ImageUrl;
            category.IsActive = dto.IsActive;
            category.IsOffer = dto.IsOffer; // 👈 Added
            category.ParentCategoryId = dto.ParentCategoryId;

            _unitOfWork.Categories.Update(category);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return false;

            _unitOfWork.Categories.Remove(category);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}