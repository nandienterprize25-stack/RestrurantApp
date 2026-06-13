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
    public class MenuItemsController : ControllerBase
    {
        private readonly IMenuItemService _menuItemService;

        public MenuItemsController(IMenuItemService menuItemService)
        {
            _menuItemService = menuItemService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetAll([FromQuery] bool includeInactive = false, [FromQuery] Guid? categoryId = null)
        {
            var items = await _menuItemService.GetAllMenuItemsAsync(includeInactive, categoryId);
            return Ok(items);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<MenuItemDto>> GetById(Guid id)
        {
            var item = await _menuItemService.GetMenuItemByIdAsync(id);
            if (item == null) return NotFound(new { message = "Menu Item not found." });
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<MenuItemDto>> Create(CreateMenuItemDto dto)
        {
            var createdItem = await _menuItemService.CreateMenuItemAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdItem.Id }, createdItem);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, UpdateMenuItemDto dto)
        {
            var success = await _menuItemService.UpdateMenuItemAsync(id, dto);
            if (!success) return NotFound(new { message = "Menu Item not found." });
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _menuItemService.DeleteMenuItemAsync(id);
            if (!success) return NotFound(new { message = "Menu Item not found." });
            return NoContent();
        }
    }
}