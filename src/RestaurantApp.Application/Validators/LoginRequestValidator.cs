using FluentValidation;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty().Length(4, 50);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}
