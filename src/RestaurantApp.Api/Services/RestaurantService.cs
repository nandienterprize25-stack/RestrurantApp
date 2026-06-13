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

    public Task<IReadOnlyList<RestaurantTable>> GetTablesAsync()
        => _unitOfWork.Tables.GetAllAsync();

    // public async Task<Order> CreateOrderAsync(CreateOrderRequest request, Guid creatorId)
    // {
    //     if (!await _unitOfWork.Tables.ExistsAsync(t => t.Id == request.TableId))
    //     {
    //         throw new InvalidOperationException("Table not found.");
    //     }

    //     if (!await _unitOfWork.Users.ExistsAsync(u => u.Id == creatorId))
    //     {
    //         throw new InvalidOperationException("User not found.");
    //     }

    //     var itemIds = request.Items.Select(i => i.MenuItemId).Distinct().ToList();
    //     var menuItems = await _unitOfWork.MenuItems.GetAllAsync(m => itemIds.Contains(m.Id));

    //     var order = new Order
    //     {
    //         TableId = request.TableId,
    //         CreatedById = creatorId,
    //         CreatedAt = DateTime.UtcNow,
    //         Status = OrderStatus.New,
    //         TotalAmount = 0m,
    //         Items = new List<OrderItem>()
    //     };

    //     foreach (var itemRequest in request.Items)
    //     {
    //         var menuItem = menuItems.FirstOrDefault(m => m.Id == itemRequest.MenuItemId);
    //         if (menuItem is null)
    //         {
    //             throw new InvalidOperationException($"Menu item {itemRequest.MenuItemId} not found.");
    //         }

    //         var orderItem = new OrderItem
    //         {
    //             MenuItemId = menuItem.Id,
    //             Quantity = itemRequest.Quantity,
    //             UnitPrice = menuItem.Price
    //         };

    //         order.Items.Add(orderItem);
    //         order.TotalAmount += orderItem.Quantity * orderItem.UnitPrice;
    //     }

    //     await _unitOfWork.Orders.AddAsync(order);
    //     await _unitOfWork.CompleteAsync();

    //     return order;
    // }

    // public async Task<Order> CreateOrderAsync(CreateOrderRequest request, Guid userId)
    // {
    //     var menuItems = await _unitOfWork.MenuItems.GetAllAsync();

    //     Table? table = null;
    //     if (request.TableId.HasValue && request.TableId != Guid.Empty)
    //     {
    //         table = await _unitOfWork.Tables.GetAsync(t => t.Id == request.TableId.Value);
    //     }

    //     var order = new Order
    //     {
    //         Id = Guid.NewGuid(),
    //         UserId = userId,
    //         TableId = request.TableId == Guid.Empty ? null : request.TableId,
    //         Status = OrderStatus.Pending,
    //         CreatedAt = DateTime.UtcNow
    //     };

    //     // 1. 👇 ADD THE PARENT ORDER FIRST so it exists in tracking context
    //     await _unitOfWork.Orders.AddAsync(order);

    //     decimal totalAmount = 0;
    //     foreach (var itemDto in request.Items)
    //     {
    //         var menuItem = menuItems.FirstOrDefault(m => m.Id == itemDto.MenuItemId);
    //         if (menuItem == null)
    //         {
    //             throw new InvalidOperationException($"Menu item with ID {itemDto.MenuItemId} not found.");
    //         }

    //         var orderItem = new OrderItem
    //         {
    //             Id = Guid.NewGuid(),
    //             OrderId = order.Id, // This reference is safe now!
    //             MenuItemId = menuItem.Id,
    //             Quantity = itemDto.Quantity,
    //             UnitPrice = menuItem.Price
    //         };

    //         // Fix: multiply by itemDto.Quantity to calculate actual cart item line total correctly
    //         totalAmount += (orderItem.UnitPrice * orderItem.Quantity);

    //         // 2. 👇 ADD THE CHILD ITEMS SECOND
    //         await _unitOfWork.OrderItems.AddAsync(orderItem);
    //     }

    //     // Update the aggregate amount before committing to PostgreSQL
    //     order.TotalAmount = totalAmount;

    //     // 3. 👇 COMMIT TRANSACTION CLEANLY
    //     await _unitOfWork.CompleteAsync();

    //     return order;
    // }

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request, Guid userId)
    {
        // Fetch all active menu items from the context repository layout matrix
        var menuItems = await _unitOfWork.MenuItems.GetAllAsync();

        // 1. 👇 SAFE TABLE VERIFICATION: Check if TableId has a valid, non-empty value before querying
        RestaurantTable? table = null;
        if (request.TableId.HasValue && request.TableId != Guid.Empty)
        {
            table = await _unitOfWork.Tables.GetAsync(t => t.Id == request.TableId.Value);
        }

        // 2. 👇 INITIALIZE ORDER PARENT RECORD
        var order = new Order
        {
            Id = Guid.NewGuid(),

            // Maps the authenticated user ID directly. If it arrives empty due to claim mapping issues, 
            // it falls back to your running Admin user account GUID from your database table.
            CreatedById = (userId != Guid.Empty) ? userId : Guid.Parse("6d6ec0fc-3b1a-4638-89f4-1845bb08a1e5"),

            // Gracefully handle table mapping scenarios (Take Away sets this parameter to null safely)
            TableId = (request.TableId == Guid.Empty) ? null : request.TableId,
            OrderStatus = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // 3. 👇 PARENT INJECTION: Add order entity first so it registers a tracked primary key anchor reference
        await _unitOfWork.Orders.AddAsync(order);

        decimal totalAmount = 0;

        // 4. 👇 PROCESS LINE ITEMS INNER LOOP
        foreach (var itemDto in request.Items)
        {
            var menuItem = menuItems.FirstOrDefault(m => m.Id == itemDto.MenuItemId);
            if (menuItem == null)
            {
                throw new InvalidOperationException($"Menu item with ID {itemDto.MenuItemId} not found in catalog cache.");
            }

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id, // Linking to parent tracking anchor node safely
                MenuItemId = menuItem.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = menuItem.Price
            };

            // Mathematically calculate running ledger cost based on explicit cart row count values
            totalAmount += (orderItem.UnitPrice * orderItem.Quantity);

            // Append line element data block under entity frame
            await _unitOfWork.OrderItems.AddAsync(orderItem);
        }

        // Assign final running tracking cost to our contextual order schema model wrapper
        order.GrandTotal = totalAmount;

        // 5. 👇 COMMIT TO POSTGRESQL UNIT OF WORK LAYER CLEANLY
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
        return Task.FromResult(_reportGenerator.CreateOrderPdfReport(rows, order.Id.ToString("N"), order.GrandTotal));
    }

    public Task<byte[]> CreateOrderExcelReportAsync(Order order, IReadOnlyList<OrderItemResponse> items)
    {
        var rows = items.Select(item => (item.MenuItemName, item.Quantity, item.UnitPrice, item.TotalPrice));
        return Task.FromResult(_reportGenerator.CreateOrderExcelReport(rows, order.Id.ToString("N"), order.GrandTotal));
    }

    public Task<string> CreateOrderCsvReportAsync(Order order, IReadOnlyList<OrderItemResponse> items)
    {
        var rows = items.Select(item => (item.MenuItemName, item.Quantity, item.UnitPrice, item.TotalPrice));
        return Task.FromResult(_reportGenerator.CreateOrderCsvReport(rows, order.Id.ToString("N"), order.GrandTotal));
    }


    // 👈 ADD THIS FULL METHOD BLOCK
    public async Task UpdateOrderStatusAsync(Guid orderId, string status)
    {
        // 1. Fetch matching order entry out of the UnitOfWork tracked domain context
        var order = await _unitOfWork.Orders.GetAsync(o => o.Id == orderId);
        if (order == null) throw new KeyNotFoundException("Target order structure trace absent.");

        // 2. Safely parse and assign the status state change over parameter
        if (Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            order.OrderStatus = parsedStatus;
            _unitOfWork.Orders.Update(order);

            // 3. Automated System rule: If order is completed or cancelled, free the table placement!
            if (parsedStatus == OrderStatus.Completed || parsedStatus == OrderStatus.Cancelled)
            {
                var table = await _unitOfWork.Tables.GetAsync(t => t.Id == order.TableId);
                if (table != null)
                {
                    table.Status = TableStatus.Available.ToString();
                    _unitOfWork.Tables.Update(table);
                }
            }
            else if (parsedStatus == OrderStatus.InProgress)
            {
                // Ensure table status remains Occupied while processing in the kitchen
                var table = await _unitOfWork.Tables.GetAsync(t => t.Id == order.TableId);
                if (table != null)
                {
                    table.Status = TableStatus.Occupied.ToString();
                    _unitOfWork.Tables.Update(table);
                }
            }

            // 4. Save tracking modifications to persistence layer
            await _unitOfWork.CompleteAsync();
        }
        else
        {
            throw new ArgumentException($"Invalid operational order status value requested: '{status}'");
        }
    }

    
}
