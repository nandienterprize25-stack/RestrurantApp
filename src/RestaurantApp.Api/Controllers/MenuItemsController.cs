using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Api.Mapping;
using RestaurantApp.Api.Models;
using RestaurantApp.Api.Services;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemsController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public MenuItemsController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetMenuItems()
    {
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var categories = await _restaurantService.GetCategoriesAsync();
        return Ok(new
        {
            Items = menuItems.Select(x => x.ToResponse()),
            Categories = categories.Select(x => x.ToResponse())
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<MenuItemResponse>> CreateMenuItem([FromBody] MenuItemRequest request)
    {
        var menuItem = await _restaurantService.AddMenuItemAsync(request);
        return CreatedAtAction(nameof(GetMenuItems), menuItem.ToResponse());
    }
}
