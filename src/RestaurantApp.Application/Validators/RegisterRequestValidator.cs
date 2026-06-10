using FluentValidation;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty().Length(4, 50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty().Must(r => r is "Admin" or "User").WithMessage("Role must be Admin or User.");
    }
}
