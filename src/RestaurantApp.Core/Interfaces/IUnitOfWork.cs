using RestaurantApp.Core.Entities;

namespace RestaurantApp.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Category> Categories { get; }
    IRepository<MenuItem> MenuItems { get; }
    IRepository<RestaurantTable> Tables { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    Task<int> CompleteAsync();
}
