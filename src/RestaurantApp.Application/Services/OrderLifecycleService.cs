using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RestaurantApp.Application.DTOs;
using RestaurantApp.Application.Interfaces;
using RestaurantApp.Core.Entities;
using RestaurantApp.Core.Interfaces;
using RestaurantApp.Core.Models;

namespace RestaurantApp.Application.Services
{
    public class OrderLifecycleService : IOrderLifecycleService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderLifecycleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<OrderResponseDto> PlaceOrderAsync(CreateOrderDto dto)
        {
            // 1. Fetch table mapping out of unit of work repo arrays
            var tableMatches = await _unitOfWork.Tables.GetAllAsync(t => t.Id == dto.TableId);
            var targetTable = tableMatches.FirstOrDefault();
            if (targetTable == null) throw new ArgumentException("Target system table placement reference invalid.");

            // 2. Map and compute monetary fields metrics
            decimal subtotal = 0;
            decimal totalTax = 0;
            var orderItemsList = new List<OrderItem>();

            foreach (var itemDto in dto.Items)
            {
                decimal currentItemPrice = itemDto.UnitPrice * itemDto.Quantity;
                decimal currentItemTax = currentItemPrice * (itemDto.TaxPercentage / 100);

                subtotal += currentItemPrice;
                totalTax += currentItemTax;

                orderItemsList.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    MenuItemId = itemDto.MenuItemId,
                    ItemName = itemDto.ItemName,
                    VariantName = itemDto.VariantName,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    TaxPercentage = itemDto.TaxPercentage,
                    TotalPrice = currentItemPrice
                });
            }

            // 3. Instantiate base entry tracking
            var order = new Order
            {
                Id = Guid.NewGuid(),
                InvoiceNo = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
                TableId = dto.TableId,
                WaiterName = dto.WaiterName,
                OrderStatus = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                SubTotal = subtotal,
                TaxAmount = totalTax,
                GrandTotal = subtotal + totalTax,
                OrderDate = DateTime.UtcNow,
                OrderItems = orderItemsList
            };

            // 4. Update the live table status using clean string identifiers 
            targetTable.Status = "Occupied"; // 👈 Fixed: Assigned directly as string literal
            _unitOfWork.Tables.Update(targetTable);

            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CompleteAsync();

            return MapToDto(order, targetTable.TableNumber); // 👈 Fixed: table number safely passes down as string
        }

        public async Task<IEnumerable<OrderResponseDto>> GetActiveOrdersAsync()
        {
            var orders = await _unitOfWork.Orders.GetAllAsync(o => o.OrderStatus != OrderStatus.Completed, o => o.OrderItems);
            var tables = await _unitOfWork.Tables.GetAllAsync();
            var tableMap = tables.ToDictionary(k => k.Id, v => v.TableNumber);

            return orders.Select(o => MapToDto(o, tableMap.TryGetValue(o.Id, out var num) ? num : "Unknown")).ToList();
        }

        public async Task<bool> UpdateStatusAsync(Guid orderId, string status)
        {
            var orderMatches = await _unitOfWork.Orders.GetAllAsync(o => o.Id == orderId);
            var order = orderMatches.FirstOrDefault();
            if (order == null) return false;

            if (Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
            {
                order.OrderStatus = parsedStatus;
                _unitOfWork.Orders.Update(order);
                await _unitOfWork.CompleteAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> ProcessCheckoutAsync(Guid orderId, string paymentMode)
        {
            var orderMatches = await _unitOfWork.Orders.GetAllAsync(o => o.Id == orderId);
            var order = orderMatches.FirstOrDefault();
            if (order == null) return false;

            order.OrderStatus = OrderStatus.Completed;
            order.PaymentStatus = PaymentStatus.Paid;
            if (Enum.TryParse<PaymentMode>(paymentMode, true, out var mode)) order.PaymentMode = mode;

            // Free the table placement tracking field back to Available
            var tableMatches = await _unitOfWork.Tables.GetAllAsync(t => t.Id == order.TableId);
            var targetTable = tableMatches.FirstOrDefault();
            if (targetTable != null)
            {
                targetTable.Status = "Available"; // 👈 Fixed: Reset directly as string literal
                _unitOfWork.Tables.Update(targetTable);
            }

            _unitOfWork.Orders.Update(order);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        // 👈 Fixed: Accepted argument changed to string type definition smoothly
        private OrderResponseDto MapToDto(Order o, string tableNo)
        {
            return new OrderResponseDto
            {
                Id = o.Id,
                InvoiceNo = o.InvoiceNo,
                TableId = o.TableId,
                TableNumber = tableNo,
                WaiterName = o.WaiterName,
                OrderStatus = o.OrderStatus.ToString(),
                PaymentMode = o.PaymentMode.ToString(),
                PaymentStatus = o.PaymentStatus.ToString(),
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                GrandTotal = o.GrandTotal,
                OrderDate = o.OrderDate,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    ItemName = oi.ItemName,
                    VariantName = oi.VariantName,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            };
        }
    }
}