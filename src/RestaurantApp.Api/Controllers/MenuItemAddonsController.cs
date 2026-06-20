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
    public class MenuItemAddonsController : ControllerBase
    {
        private readonly IMenuItemAddonService _addonService;

        public MenuItemAddonsController(IMenuItemAddonService addonService)
        {
            _addonService = addonService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItemAddonDto>>> GetAll()
        {
            var mappings = await _addonService.GetAllMappingsAsync();
            return Ok(mappings);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] CreateMenuItemAddonDto dto)
        {
            var success = await _addonService.AssignAddonsToItemAsync(dto);
            if (!success) return BadRequest(new { message = "Failed to establish addon mapping configurations." });
            return Ok(new { message = "Mappings assigned successfully." });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _addonService.DeleteMappingAsync(id);
            if (!success) return NotFound(new { message = "Target mapping registration link entry could not be found." });
            return NoContent();
        }
    }
}