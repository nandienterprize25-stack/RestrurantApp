using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;

namespace RestaurantApp.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
        {
            var admin = new User
            {
                Username = "admin",
                Email = "admin@restaurant.local",
                FullName = "Restaurant Administrator",
                Role = "Admin",
                PasswordHash = passwordHasher.Hash("Admin@123"),
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(admin);
        }

        if (!await context.Categories.AnyAsync())
        {
            var food = new Category { Name = "Food" };
            var drinks = new Category { Name = "Drinks" };
            await context.Categories.AddRangeAsync(food, drinks);
            await context.SaveChangesAsync();

            await context.MenuItems.AddRangeAsync(
                new MenuItem { Name = "Grilled Salmon", Description = "Fresh salmon fillet with lemon butter.", Price = 24.90m, CategoryId = food.Id },
                new MenuItem { Name = "Chef Salad", Description = "Seasonal greens with grilled chicken and house dressing.", Price = 14.50m, CategoryId = food.Id },
                new MenuItem { Name = "Espresso", Description = "Strong Italian espresso shot.", Price = 3.50m, CategoryId = drinks.Id },
                new MenuItem { Name = "Craft Lemonade", Description = "House-made lemonade with mint.", Price = 5.20m, CategoryId = drinks.Id }
            );
        }

        if (!await context.Tables.AnyAsync())
        {
            await context.Tables.AddRangeAsync(
                new Table { Number = 1, Capacity = 4 },
                new Table { Number = 2, Capacity = 4 },
                new Table { Number = 3, Capacity = 6 }
            );
        }

        await context.SaveChangesAsync();
    }
}
