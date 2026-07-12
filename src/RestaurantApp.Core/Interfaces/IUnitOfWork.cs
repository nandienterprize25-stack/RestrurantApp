using RestaurantApp.Core.Entities;

namespace RestaurantApp.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Category> Categories { get; }
    IRepository<MenuItem> MenuItems { get; }
    IRepository<FoodVariant> FoodVariants { get; }
    IRepository<MenuItemAddon> MenuItemAddons{get;}

    IRepository<GroupItemChild> GroupItemChildren { get; }
    IRepository<RestaurantTable> Tables { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }

    // 🌟 NEWLY ADDED REPOSITORIES
    IRepository<Reservation> Reservations { get; }
    IRepository<ReservationItem> ReservationItems { get; }
    IRepository<UnavailabilityDay> UnavailabilityDays { get; }
    Task<int> CompleteAsync();
}
