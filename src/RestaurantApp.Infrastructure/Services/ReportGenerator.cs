using System.Globalization;
using System.IO;
using System.Text;
using ClosedXML.Excel;
using CsvHelper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using RestaurantApp.Core.Interfaces;

namespace RestaurantApp.Infrastructure.Services;

public class ReportGenerator : IReportGenerator
{
    public byte[] CreateOrderPdfReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount)
    {
        using var memoryStream = new MemoryStream();
        using var document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.GetInstance(document, memoryStream);
        document.Open();

        var title = new Paragraph($"Order Report #{orderNumber}")
        {
            Alignment = Element.ALIGN_CENTER,
            SpacingAfter = 12f,
            Font = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16)
        };

        document.Add(title);

        var table = new PdfPTable(4) { WidthPercentage = 100 };
        table.SetWidths(new[] { 45f, 15f, 20f, 20f });
        AddCell(table, "Item", true);
        AddCell(table, "Qty", true);
        AddCell(table, "Unit Price", true);
        AddCell(table, "Total", true);

        foreach (var item in items)
        {
            AddCell(table, item.ItemName);
            AddCell(table, item.Quantity.ToString());
            AddCell(table, item.UnitPrice.ToString("C"));
            AddCell(table, item.Total.ToString("C"));
        }

        document.Add(table);
        document.Add(new Paragraph($"Total Amount: {totalAmount:C}") { SpacingBefore = 12f, Alignment = Element.ALIGN_RIGHT });
        document.Close();

        return memoryStream.ToArray();
    }

    public byte[] CreateOrderExcelReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("OrderReport");
        worksheet.Cell(1, 1).Value = "Order";
        worksheet.Cell(1, 2).Value = orderNumber;
        worksheet.Cell(3, 1).Value = "Item";
        worksheet.Cell(3, 2).Value = "Quantity";
        worksheet.Cell(3, 3).Value = "Unit Price";
        worksheet.Cell(3, 4).Value = "Total";

        var row = 4;
        foreach (var item in items)
        {
            worksheet.Cell(row, 1).Value = item.ItemName;
            worksheet.Cell(row, 2).Value = item.Quantity;
            worksheet.Cell(row, 3).Value = item.UnitPrice;
            worksheet.Cell(row, 4).Value = item.Total;
            row++;
        }

        worksheet.Cell(row, 3).Value = "Total";
        worksheet.Cell(row, 4).Value = totalAmount;
        worksheet.Columns().AdjustToContents();

        using var memoryStream = new MemoryStream();
        workbook.SaveAs(memoryStream);
        return memoryStream.ToArray();
    }

    public string CreateOrderCsvReport(IEnumerable<(string ItemName, int Quantity, decimal UnitPrice, decimal Total)> items, string orderNumber, decimal totalAmount)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"Order,{orderNumber}");
        builder.AppendLine("Item,Quantity,Unit Price,Total");

        foreach (var item in items)
        {
            builder.AppendLine($"\"{EscapeCsv(item.ItemName)}\",{item.Quantity},{item.UnitPrice},{item.Total}");
        }

        builder.AppendLine($"Total,,,{totalAmount}");
        return builder.ToString();
    }

    private static string EscapeCsv(string value)
    {
        return value.Replace("\"", "\"\"");
    }

    private static void AddCell(PdfPTable table, string text, bool bold = false)
    {
        var font = bold ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11) : FontFactory.GetFont(FontFactory.HELVETICA, 10);
        var cell = new PdfPCell(new Phrase(text, font)) { Padding = 6, HorizontalAlignment = Element.ALIGN_LEFT };
        table.AddCell(cell);
    }
}
