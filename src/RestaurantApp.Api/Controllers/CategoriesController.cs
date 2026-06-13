using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // 👈 Core Logging Framework Namespace
using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;

namespace RestaurantApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IValidator<CreateCategoryDto> _createValidator;
        private readonly IValidator<UpdateCategoryDto> _updateValidator;
        private readonly ILogger<CategoriesController> _logger; // 👈 Private Logger Token Instance

        public CategoriesController(
            ICategoryService categoryService,
            IValidator<CreateCategoryDto> createValidator,
            IValidator<UpdateCategoryDto> updateValidator,
            ILogger<CategoriesController> logger) // 👈 Dependency Injection Channel
        {
            _categoryService = categoryService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
        }

        // Add this method inside your CategoriesController class structure:
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll([FromQuery] bool includeInactive = false)
        {
            try
            {
                _logger.LogInformation("Fetching categories list. Include inactive filter setting: {IncludeInactive}", includeInactive);

                // Call your service layer to retrieve the categories list
                var categories = await _categoryService.GetAllCategoriesAsync(includeInactive);

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching the categories data structure matrix.");
                return StatusCode(500, new { message = "Internal server processing anomaly registered." });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto dto)
        {
            _logger.LogInformation("Initiating asset configuration storage processing for payload entry target name: {Name}", dto.Name);

            // 1. Check if category name validation passes
            var validationResult = await _createValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            // 2. Prevent Duplicate Category Creation Check Block
            var existingCategories = await _categoryService.GetAllCategoriesAsync(includeInactive: true);
            bool nameExists = existingCategories.Any(c => c.Name.Trim().Equals(dto.Name.Trim(), StringComparison.OrdinalIgnoreCase));

            if (nameExists)
            {
                _logger.LogWarning("Execution halted: A category classification labeled '{Name}' already exists.", dto.Name);
                return BadRequest(new { message = $"A category named '{dto.Name}' already exists. Please choose a unique name." });
            }

            // 3. Save entity record parameters
            try
            {
                var category = await _categoryService.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An anomaly interrupted structural storage initialization workflows on payload content execution mapping.");
                return StatusCode(500, new { message = "Failed to synchronize operational state to backend repository context structure." });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateCategoryDto dto)
        {
            _logger.LogInformation("Initiating revision parameters override sequence for Category Key Reference ID: {Id}", id);

            try
            {
                var validationResult = await _updateValidator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    _logger.LogWarning("Structural modifications rejected for Category Reference ID: {Id} due to input anomalies.", id);
                    return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
                }

                var success = await _categoryService.UpdateCategoryAsync(id, dto);
                if (!success)
                {
                    _logger.LogWarning("Modifications lookup query faulted: Category reference ID target target {Id} does not exist inside storage sets.", id);
                    return NotFound(new { message = "Category database record missing." });
                }

                _logger.LogInformation("Successfully updated category entry parameters for identification pointer: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical failure encountered while attempting structural changes on Category Key Reference: {Id}", id);

                return StatusCode(500, new
                {
                    message = "Could not synchronize state data parameters to database persistence storage.",
                    detail = "System tracing record filed."
                });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CategoryDto>> GetById(Guid id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Category fetch failed: Identifier pointer target {Id} not found.", id);
                return NotFound(new { message = "Category not found." });
            }
            return Ok(category);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                _logger.LogInformation("Initiating data elimination sequence for category resource target identification pointer: {Id}", id);

                // Double check your _categoryService implementation name 
                // It could be DeleteCategoryAsync or DeleteCategory depending on your interface definition
                var success = await _categoryService.DeleteCategoryAsync(id);

                if (!success)
                {
                    _logger.LogWarning("Delete request failed: Category entity matching ID reference {Id} not found.", id);
                    return NotFound(new { message = "Category record missing or already deleted." });
                }

                _logger.LogInformation("Successfully removed category record configuration for identifier target: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while removing the category entity mapping data structures for tracking pointer: {Id}", id);
                return StatusCode(500, new { message = "Internal database constraint or system processing issue aborted the transaction." });
            }
        }
    }
}