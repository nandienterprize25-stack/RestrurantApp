using System;
using System.Collections.Generic;

namespace RestaurantApp.Core.Entities;

public enum ReservationType
{
    TableBooking,
    FoodBooking,
    TakeOrder
}

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Sl { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerAddress { get; set; }
    public string? PhoneNo { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    
    // Core Parameters
    public string? TableNo { get; set; }
    public int NumberOfPeople { get; set; }
    public DateTime BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Category { get; set; } // e.g. LUNCH, DINNER
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled
    public ReservationType Type { get; set; }

    // Finance Aggregates
    public decimal AdvancedAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? PaymentMode { get; set; }
    public DateTime? PaymentDate { get; set; }

    // Child records collection link tracking
    public ICollection<ReservationItem> Items { get; set; } = new List<ReservationItem>();
}

public class ReservationItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReservationId { get; set; }
    public int Sl { get; set; }
    public DateTime Date { get; set; }
    public string? RoomNo { get; set; }
    public string? Category { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Qty { get; set; }
    public decimal Total { get; set; }
}

public class UnavailabilityDay
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Sl { get; set; }
    public DateTime UnavailableDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive
}