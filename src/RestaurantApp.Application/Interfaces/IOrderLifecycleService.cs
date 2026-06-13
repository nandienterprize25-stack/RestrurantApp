using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Interfaces
{
    public interface IOrderLifecycleService
    {
        Task<OrderResponseDto> PlaceOrderAsync(CreateOrderDto dto);
        Task<IEnumerable<OrderResponseDto>> GetActiveOrdersAsync();
        Task<bool> UpdateStatusAsync(Guid orderId, string status);
        Task<bool> ProcessCheckoutAsync(Guid orderId, string paymentMode);
    }
}