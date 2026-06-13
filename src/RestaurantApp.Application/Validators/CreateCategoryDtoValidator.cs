using FluentValidation;
using RestaurantApp.Application.DTOs;

namespace RestaurantApp.Application.Validators
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Category Name is mandatory and cannot remain blank.")
                .MaximumLength(100).WithMessage("Category Name cannot exceed 100 characters.");
                
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description details context cannot exceed 500 characters.");
        }
    }

    public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Category Name is mandatory and cannot remain blank.")
                .MaximumLength(100).WithMessage("Category Name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description details context cannot exceed 500 characters.");
        }
    }
}