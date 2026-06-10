using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Api.Mapping;
using RestaurantApp.Api.Models;
using RestaurantApp.Api.Services;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public AuthController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register([FromBody] CreateUserRequest request)
    {
        var user = await _restaurantService.CreateUserAsync(request);
        return Created(string.Empty, user.ToResponse());
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthenticateResponse>> Login([FromBody] LoginRequest request)
    {
        var token = await _restaurantService.AuthenticateAsync(request);
        var loggedInUser = await _restaurantService.GetUserByUsernameAsync(request.Username);
        if (loggedInUser is null)
        {
            return Unauthorized(new ErrorResponse { Message = "Authentication failed." });
        }

        return Ok(new AuthenticateResponse
        {
            Token = token,
            User = loggedInUser.ToResponse()
        });
    }
}
