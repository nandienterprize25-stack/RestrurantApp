namespace RestaurantApp.Core.Interfaces;

public interface IReportGenerator
{
    byte[] CreateOrderPdfReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount);
    byte[] CreateOrderExcelReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount);
    string CreateOrderCsvReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount);
}
