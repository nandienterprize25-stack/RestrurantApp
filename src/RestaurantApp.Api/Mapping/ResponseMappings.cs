using RestaurantApp.Api.Models;
using RestaurantApp.Core.Entities;

namespace RestaurantApp.Api.Mapping;

public static class ResponseMappings
{
    public static UserResponse ToResponse(this User user)
        => new()
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };

    public static MenuItemResponse ToResponse(this MenuItem menuItem)
        => new()
        {
            Id = menuItem.Id,
            Name = menuItem.Name,
            Description = menuItem.Description,
            Price = menuItem.Price,
            Category = menuItem.Category?.Name ?? string.Empty
        };

    public static CategoryResponse ToResponse(this Category category)
        => new()
        {
            Id = category.Id,
            Name = category.Name
        };

    public static TableResponse ToResponse(this RestaurantTable table)
        => new()
        {
            Id = table.Id,
            Number = table.TableNumber,
            Capacity = table.SeatingCapacity,
            Status = table.Status.ToString()
        };

   public static OrderItemResponse ToResponse(this OrderItem item, string menuItemName)
        {
            return new OrderItemResponse
            {
                Id = item.Id,
                MenuItemId = item.MenuItemId,
                MenuItemName = menuItemName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                //TotalPrice = item.Quantity * item.UnitPrice
            };
        }

        public static OrderResponse ToResponse(this Order order, string tableNumber, string creatorName, List<OrderItemResponse> items)
        {
            return new OrderResponse
            {
                Id = order.Id,
                TableId = order.TableId,
                TableNumber = tableNumber,
                CreatedByUsername = creatorName,
                Status = order.OrderStatus.ToString(),
                TotalAmount = order.GrandTotal,
                CreatedAt = order.CreatedAt,
                Items = items
            };
        }
        }
