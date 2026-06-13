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
        // 1. Seed Table Areas if none exist yet
        if (!await context.TableAreas.AnyAsync())
        {
            await context.TableAreas.AddRangeAsync(
                new TableArea { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), AreaName = "MAIN DINING HALL", IsActive = true },
                new TableArea { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), AreaName = "VIP LOUNGE", IsActive = true }
            );
            await context.SaveChangesAsync();
        }

        // 2. Grab a default Area Id to map the tables to
        var defaultArea = await context.TableAreas.FirstAsync();

        // 3. Seed Tables with the mandatory relationship tracking ID
        if (!await context.Tables.AnyAsync())
        {
            context.Tables.AddRange(
                new RestaurantTable
                {
                    Id = Guid.NewGuid(),
                    TableNumber = "T1",
                    SeatingCapacity = 2,
                    Status = TableStatus.Available.ToString(),
                    TableAreaId = defaultArea.Id // 👈 Add this line
                },
                new RestaurantTable
                {
                    Id = Guid.NewGuid(),
                    TableNumber = "T2",
                    SeatingCapacity = 4,
                    Status = TableStatus.Available.ToString(),
                    TableAreaId = defaultArea.Id // 👈 Add this line
                },
                new RestaurantTable
                {
                    Id = Guid.NewGuid(),
                    TableNumber = "T3",
                    SeatingCapacity = 4,
                    Status = TableStatus.Available.ToString(),
                    TableAreaId = defaultArea.Id // 👈 Add this line
                },
                new RestaurantTable
                {
                    Id = Guid.NewGuid(),
                    TableNumber = "T4",
                    SeatingCapacity = 6,
                    Status = TableStatus.Available.ToString(),
                    TableAreaId = defaultArea.Id // 👈 Add this line
                }
            );

            await context.SaveChangesAsync();
        }
    }
}
