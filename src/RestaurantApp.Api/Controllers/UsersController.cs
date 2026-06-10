using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Api.Mapping;
using RestaurantApp.Api.Models;
using RestaurantApp.Api.Services;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public UsersController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> GetUsers()
    {
        var users = await _restaurantService.GetUsersAsync();
        return Ok(users.Select(u => u.ToResponse()));
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _restaurantService.CreateUserAsync(request);
        return Created(string.Empty, user.ToResponse());
    }
}
