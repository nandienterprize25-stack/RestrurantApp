using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;

namespace RestaurantApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FoodVariantsController : ControllerBase
    {
        private readonly IFoodVariantService _variantService;

        public FoodVariantsController(IFoodVariantService variantService)
        {
            _variantService = variantService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodVariantDto>>> GetAll()
        {
            var items = await _variantService.GetAllVariantsAsync();
            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<FoodVariantDto>> GetById(Guid id)
        {
            var item = await _variantService.GetVariantByIdAsync(id);
            if (item == null) return NotFound(new { message = "Food Variant setup choice not found." });
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<FoodVariantDto>> Create([FromBody] CreateFoodVariantDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Name) || dto.Price < 0)
            {
                return BadRequest(new { message = "Invalid data payload details submitted." });
            }

            var createdVariant = await _variantService.CreateVariantAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdVariant.Id }, createdVariant);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFoodVariantDto dto)
        {
            var success = await _variantService.UpdateVariantAsync(id, dto);
            if (!success) return NotFound(new { message = "Target Food Variant not found." });
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _variantService.DeleteVariantAsync(id);
            if (!success) return NotFound(new { message = "Target Variant row reference does not exist inside database rows." });
            return NoContent();
        }
    }
}