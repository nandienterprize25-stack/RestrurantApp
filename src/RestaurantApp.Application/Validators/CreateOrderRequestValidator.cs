using FluentValidation;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.TableId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must contain at least one item.");
        RuleForEach(x => x.Items).ChildRules(items =>
        {
            items.RuleFor(x => x.MenuItemId).NotEmpty();
            items.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}
