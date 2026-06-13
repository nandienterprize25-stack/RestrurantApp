namespace RestaurantApp.Core.Entities
{
    // public enum OrderStatus
    // {
    //     Pending,
    //     Processing,
    //     Completed,
    //     Cancelled
    // }

    public enum OrderStatus
    {
        New,
        InProgress,
        Completed,
        Cancelled,
        Pending
    }

    public enum PaymentMode
    {
        Cash,
        Card,
        UPI,
        DigitalWallet
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Refunded
    }
}