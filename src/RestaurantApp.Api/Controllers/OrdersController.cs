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

            var tableNumber = tables.FirstOrDefault(t => t.Id == order.TableId)?.TableNumber ?? string.Empty;
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
        var tableNumber = tables.FirstOrDefault(t => t.Id == order.TableId)?.TableNumber ?? string.Empty;
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
        var tableNumber = (await _restaurantService.GetTablesAsync()).FirstOrDefault(t => t.Id == order.TableId)?.TableNumber ?? string.Empty;
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
        // 1. Check clean JWT sub claim
        var sub = User.FindFirstValue("sub");
        if (Guid.TryParse(sub, out var userId)) return userId;

        // 2. Check clean id claim (if auth service names it 'id')
        var explicitId = User.FindFirstValue("id");
        if (Guid.TryParse(explicitId, out var customId)) return customId;

        // 3. Fallback: Check standard fallback name identifier schema
        var nameId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (Guid.TryParse(nameId, out var backupId)) return backupId;

        // 4. Fallback: Loop over whatever keys exist to hunt for a valid Guid string dynamically
        foreach (var claim in User.Claims)
        {
            if (Guid.TryParse(claim.Value, out var dynamicGuid) && dynamicGuid != Guid.Empty)
            {
                return dynamicGuid;
            }
        }

        // 5. If it still returns empty, the token being sent from Angular contains no user metadata fields.
        return Guid.Empty;
    }
    [HttpGet("tables-layout")]
    public async Task<ActionResult<object>> GetTablesLayout()
    {
        var tables = await _restaurantService.GetTablesAsync();
        return Ok(tables.Select(t => new
        {
            id = t.Id,
            number = t.TableNumber,
            displayName = $"Table {t.TableNumber:D2}",
            capacity = t.SeatingCapacity,
            status = t.Status.ToString() // e.g., "Available", "Occupied"
        }));
    }

    [HttpPut("{id}/status")]
public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateStatusRequest request)
{
    var order = await _restaurantService.GetOrderAsync(id);
    if (order is null)
    {
        return NotFound(new { message = "Target transaction element trace absent." });
    }

    // Update status string/enum based on your domain rule logic execution
    await _restaurantService.UpdateOrderStatusAsync(id, request.Status);
    return NoContent();
}

// Simple request wrapper payload matching the Angular body signature
public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
}
