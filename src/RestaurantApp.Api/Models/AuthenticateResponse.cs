namespace RestaurantApp.Api.Models;

public class AuthenticateResponse
{
    public string Token { get; set; } = null!;
    public UserResponse User { get; set; } = null!;
}
