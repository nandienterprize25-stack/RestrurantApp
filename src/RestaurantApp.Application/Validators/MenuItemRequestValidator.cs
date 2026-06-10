using FluentValidation;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Validators;

public class MenuItemRequestValidator : AbstractValidator<MenuItemRequest>
{
    public MenuItemRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}
