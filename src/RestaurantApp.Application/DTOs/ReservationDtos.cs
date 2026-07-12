namespace RestaurantApp.Application.DTOs;

public class ReservationItemDto
{
    public int Sl { get; set; }
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string? RoomNo { get; set; }
    public string? Category { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Qty { get; set; }
    public decimal Total { get; set; }
}

public class ReservationDto
{
    public Guid? Id { get; set; }
    public int Sl { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerAddress { get; set; }
    public string? PhoneNo { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    
    public string? TableNo { get; set; }
    public int NumberOfPeople { get; set; }
    public string BookingDate { get; set; } = string.Empty; // yyyy-MM-dd
    public string StartTime { get; set; } = "18:00"; // HH:mm
    public string EndTime { get; set; } = "20:00";   // HH:mm
    public string? Category { get; set; }
    public string Status { get; set; } = "Pending";
    public string Type { get; set; } = "TableBooking"; // TableBooking, FoodBooking, TakeOrder

    public decimal AdvancedAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? PaymentMode { get; set; }
    public string? PaymentDate { get; set; }

    public List<ReservationItemDto> Items { get; set; } = new();
}

public class UnavailabilityDayDto
{
    public Guid? Id { get; set; }
    public int Sl { get; set; }
    public string UnavailableDate { get; set; } = string.Empty; // yyyy-MM-dd
    public string StartTime { get; set; } = "00:00"; // HH:mm
    public string EndTime { get; set; } = "23:59";   // HH:mm
    public string Status { get; set; } = "Active";
}