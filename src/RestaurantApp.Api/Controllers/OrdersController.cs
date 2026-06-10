using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantApp.Api.Mapping;
using RestaurantApp.Api.Models;
using RestaurantApp.Api.Services;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public OrdersController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> GetOrders()
    {
        var userId = GetCurrentUserId();
        var orders = await _restaurantService.GetOrdersAsync(userId);

        var users = await _restaurantService.GetUsersAsync();
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var tables = await _restaurantService.GetTablesAsync();

        var response = new List<OrderResponse>();
        foreach (var order in orders)
        {
            var orderItems = (await _restaurantService.GetOrderItemsAsync(order.Id))
                .Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty))
                .ToList();

            var tableNumber = tables.FirstOrDefault(t => t.Id == order.TableId)?.Number ?? 0;
            var creator = users.FirstOrDefault(u => u.Id == order.CreatedById)?.Username ?? string.Empty;
            response.Add(order.ToResponse(tableNumber, creator, orderItems));
        }

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponse>> GetOrder(Guid id)
    {
        var order = await _restaurantService.GetOrderAsync(id);
        if (order is null)
        {
            return NotFound();
        }

        var users = await _restaurantService.GetUsersAsync();
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var tables = await _restaurantService.GetTablesAsync();
        var orderItems = await _restaurantService.GetOrderItemsAsync(order.Id);

        var responseItems = orderItems.Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty)).ToList();
        var tableNumber = tables.FirstOrDefault(t => t.Id == order.TableId)?.Number ?? 0;
        var creator = users.FirstOrDefault(u => u.Id == order.CreatedById)?.Username ?? string.Empty;

        return Ok(order.ToResponse(tableNumber, creator, responseItems));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetCurrentUserId();
        var order = await _restaurantService.CreateOrderAsync(request, userId);
        var orderItems = await _restaurantService.GetOrderItemsAsync(order.Id);
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var tableNumber = (await _restaurantService.GetTablesAsync()).FirstOrDefault(t => t.Id == order.TableId)?.Number ?? 0;
        var creator = (await _restaurantService.GetUserByIdAsync(order.CreatedById))?.Username ?? string.Empty;

        var responseItems = orderItems.Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty)).ToList();
        var response = order.ToResponse(tableNumber, creator, responseItems);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DownloadPdf(Guid id)
    {
        var order = await _restaurantService.GetOrderAsync(id);
        if (order is null)
        {
            return NotFound();
        }

        var orderItems = await _restaurantService.GetOrderItemsAsync(order.Id);
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var responseItems = orderItems.Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty)).ToList();
        var report = await _restaurantService.CreateOrderPdfReportAsync(order, responseItems);

        return File(report, "application/pdf", $"order-{order.Id}.pdf");
    }

    [HttpGet("{id}/excel")]
    public async Task<IActionResult> DownloadExcel(Guid id)
    {
        var order = await _restaurantService.GetOrderAsync(id);
        if (order is null)
        {
            return NotFound();
        }

        var orderItems = await _restaurantService.GetOrderItemsAsync(order.Id);
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var responseItems = orderItems.Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty)).ToList();
        var report = await _restaurantService.CreateOrderExcelReportAsync(order, responseItems);

        return File(report, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"order-{order.Id}.xlsx");
    }

    [HttpGet("{id}/csv")]
    public async Task<IActionResult> DownloadCsv(Guid id)
    {
        var order = await _restaurantService.GetOrderAsync(id);
        if (order is null)
        {
            return NotFound();
        }

        var orderItems = await _restaurantService.GetOrderItemsAsync(order.Id);
        var menuItems = await _restaurantService.GetMenuItemsAsync();
        var responseItems = orderItems.Select(item => item.ToResponse(menuItems.FirstOrDefault(m => m.Id == item.MenuItemId)?.Name ?? string.Empty)).ToList();
        var report = await _restaurantService.CreateOrderCsvReportAsync(order, responseItems);

        return File(System.Text.Encoding.UTF8.GetBytes(report), "text/csv", $"order-{order.Id}.csv");
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(sub, out var userId) ? userId : Guid.Empty;
    }
}
