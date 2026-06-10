using RestaurantApp.Core.Entities;

namespace RestaurantApp.Core.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(User user);
}
