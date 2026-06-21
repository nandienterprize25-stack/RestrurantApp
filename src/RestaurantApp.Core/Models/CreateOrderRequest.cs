namespace RestaurantApp.Core.Models;

// public class CreateOrderRequest
// {
//     public Guid? TableId { get; set; }
//     public IList<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
// }


public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string WaiterName { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;

    // This intercepts 'paymentMode' sent from the front-end payload mapping matrix
    public string PaymentMode { get; set; } = string.Empty;

    public decimal CashPaid { get; set; }
    public decimal CardPaid { get; set; }
    public decimal UpiPaid { get; set; }

    public Guid? TableId { get; set; }
    public IList<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
}
