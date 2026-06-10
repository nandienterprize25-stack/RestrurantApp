using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Models;
using RestaurantApp.Api.Models;

namespace RestaurantApp.Api.Services;

public interface IRestaurantService
{
    Task<User> CreateUserAsync(CreateUserRequest request);
    Task<string> AuthenticateAsync(LoginRequest request);
    Task<IReadOnlyList<User>> GetUsersAsync();
    Task<IReadOnlyList<MenuItem>> GetMenuItemsAsync();
    Task<MenuItem> AddMenuItemAsync(MenuItemRequest request);
    Task<IReadOnlyList<Category>> GetCategoriesAsync();
    Task<IReadOnlyList<Table>> GetTablesAsync();
    Task<Order> CreateOrderAsync(CreateOrderRequest request, Guid creatorId);
    Task<IReadOnlyList<Order>> GetOrdersAsync(Guid? userId = null);
    Task<Order?> GetOrderAsync(Guid orderId);
    Task<IReadOnlyList<OrderItem>> GetOrderItemsAsync(Guid orderId);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<byte[]> CreateOrderPdfReportAsync(Order order, IReadOnlyList<OrderItemResponse> items);
    Task<byte[]> CreateOrderExcelReportAsync(Order order, IReadOnlyList<OrderItemResponse> items);
    Task<string> CreateOrderCsvReportAsync(Order order, IReadOnlyList<OrderItemResponse> items);
}
