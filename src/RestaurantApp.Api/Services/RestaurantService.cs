using RestaurantApp.Api.Models;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Api.Services;

public sealed class RestaurantService : IRestaurantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IReportGenerator _reportGenerator;

    public RestaurantService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IReportGenerator reportGenerator)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _reportGenerator = reportGenerator;
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request)
    {
        if (await _unitOfWork.Users.ExistsAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        if (await _unitOfWork.Users.ExistsAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            Role = request.Role,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();
        return user;
    }

    public async Task<string> AuthenticateAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetAsync(u => u.Username == request.Username);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid username or password.");
        }

        return _jwtTokenService.CreateToken(user);
    }

    public Task<IReadOnlyList<User>> GetUsersAsync()
        => _unitOfWork.Users.GetAllAsync();

    public Task<IReadOnlyList<MenuItem>> GetMenuItemsAsync()
        => _unitOfWork.MenuItems.GetAllAsync();

    public async Task<MenuItem> AddMenuItemAsync(MenuItemRequest request)
    {
        if (!await _unitOfWork.Categories.ExistsAsync(c => c.Id == request.CategoryId))
        {
            throw new InvalidOperationException("Category not found.");
        }

        var menuItem = new MenuItem
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId
        };

        await _unitOfWork.MenuItems.AddAsync(menuItem);
        await _unitOfWork.CompleteAsync();
        return menuItem;
    }

    public Task<IReadOnlyList<Category>> GetCategoriesAsync()
        => _unitOfWork.Categories.GetAllAsync();

    public Task<IReadOnlyList<Table>> GetTablesAsync()
        => _unitOfWork.Tables.GetAllAsync();

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request, Guid creatorId)
    {
        if (!await _unitOfWork.Tables.ExistsAsync(t => t.Id == request.TableId))
        {
            throw new InvalidOperationException("Table not found.");
        }

        if (!await _unitOfWork.Users.ExistsAsync(u => u.Id == creatorId))
        {
            throw new InvalidOperationException("User not found.");
        }

        var itemIds = request.Items.Select(i => i.MenuItemId).Distinct().ToList();
        var menuItems = await _unitOfWork.MenuItems.GetAllAsync(m => itemIds.Contains(m.Id));

        var order = new Order
        {
            TableId = request.TableId,
            CreatedById = creatorId,
            CreatedAt = DateTime.UtcNow,
            Status = OrderStatus.New,
            TotalAmount = 0m,
            Items = new List<OrderItem>()
        };

        foreach (var itemRequest in request.Items)
        {
            var menuItem = menuItems.FirstOrDefault(m => m.Id == itemRequest.MenuItemId);
            if (menuItem is null)
            {
                throw new InvalidOperationException($"Menu item {itemRequest.MenuItemId} not found.");
            }

            var orderItem = new OrderItem
            {
                MenuItemId = menuItem.Id,
                Quantity = itemRequest.Quantity,
                UnitPrice = menuItem.Price
            };

            order.Items.Add(orderItem);
            order.TotalAmount += orderItem.Quantity * orderItem.UnitPrice;
        }

        await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.CompleteAsync();

        return order;
    }

    public Task<IReadOnlyList<Order>> GetOrdersAsync(Guid? userId = null)
    {
        if (userId.HasValue)
        {
            return _unitOfWork.Orders.GetAllAsync(o => o.CreatedById == userId.Value);
        }

        return _unitOfWork.Orders.GetAllAsync();
    }

    public Task<Order?> GetOrderAsync(Guid orderId)
        => _unitOfWork.Orders.GetAsync(o => o.Id == orderId);

    public Task<IReadOnlyList<OrderItem>> GetOrderItemsAsync(Guid orderId)
        => _unitOfWork.OrderItems.GetAllAsync(i => i.OrderId == orderId);

    public Task<User?> GetUserByIdAsync(Guid id)
        => _unitOfWork.Users.GetAsync(u => u.Id == id);

    public Task<User?> GetUserByUsernameAsync(string username)
        => _unitOfWork.Users.GetAsync(u => u.Username == username);

    public Task<byte[]> CreateOrderPdfReportAsync(Order order, IReadOnlyList<OrderItemResponse> items)
    {
        var rows = items.Select(item => (item.MenuItemName, item.Quantity, item.UnitPrice, item.TotalPrice));
        return Task.FromResult(_reportGenerator.CreateOrderPdfReport(rows, order.Id.ToString("N"), order.TotalAmount));
    }

    public Task<byte[]> CreateOrderExcelReportAsync(Order order, IReadOnlyList<OrderItemResponse> items)
    {
        var rows = items.Select(item => (item.MenuItemName, item.Quantity, item.UnitPrice, item.TotalPrice));
        return Task.FromResult(_reportGenerator.CreateOrderExcelReport(rows, order.Id.ToString("N"), order.TotalAmount));
    }

    public Task<string> CreateOrderCsvReportAsync(Order order, IReadOnlyList<OrderItemResponse> items)
    {
        var rows = items.Select(item => (item.MenuItemName, item.Quantity, item.UnitPrice, item.TotalPrice));
        return Task.FromResult(_reportGenerator.CreateOrderCsvReport(rows, order.Id.ToString("N"), order.TotalAmount));
    }
}
