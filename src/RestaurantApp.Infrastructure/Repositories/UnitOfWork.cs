using Microsoft.EntityFrameworkCore;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;
using RestaurantApp.Infrastructure.Data;

namespace RestaurantApp.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly RestaurantDbContext _context;
    private Repository<User>? _users;
    private Repository<Category>? _categories;
    private Repository<MenuItem>? _menuItems;
    private Repository<RestaurantTable>? _tables;
    private Repository<Order>? _orders;
    private Repository<OrderItem>? _orderItems;
    private Repository<FoodVariant>? _foodVariants;

    private Repository<MenuItemAddon>? _menuItemAddon;


    private Repository<GroupItemChild>? _groupItemChildren;
   
    // 🌟 NEW BACKING STORAGE POINTERS
    private Repository<Reservation>? _reservations;
    private Repository<ReservationItem>? _reservationItems;
    private Repository<UnavailabilityDay>? _unavailabilityDays;


    public UnitOfWork(RestaurantDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
    public IRepository<MenuItem> MenuItems => _menuItems ??= new Repository<MenuItem>(_context);
    public IRepository<RestaurantTable> Tables => _tables ??= new Repository<RestaurantTable>(_context);
    public IRepository<Order> Orders => _orders ??= new Repository<Order>(_context);
    public IRepository<OrderItem> OrderItems => _orderItems ??= new Repository<OrderItem>(_context);
    public IRepository<FoodVariant> FoodVariants => _foodVariants ??= new Repository<FoodVariant>(_context);
    public IRepository<GroupItemChild> GroupItemChildren => _groupItemChildren ??= new Repository<GroupItemChild>(_context);

    public IRepository<MenuItemAddon> MenuItemAddons=>_menuItemAddon??=new Repository<MenuItemAddon>(_context);

// 🌟 CONCRETE INSTANTIATIONS
    public IRepository<Reservation> Reservations => _reservations ??= new Repository<Reservation>(_context);
    public IRepository<ReservationItem> ReservationItems => _reservationItems ??= new Repository<ReservationItem>(_context);
    public IRepository<UnavailabilityDay> UnavailabilityDays => _unavailabilityDays ??= new Repository<UnavailabilityDay>(_context);
    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
