import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

// AG-Grid Modular Registrations
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';

// 1. IMPORT THE MISSING PIPELINE MODULES
import { 
  ClientSideRowModelModule, 
  PaginationModule, 
  CsvExportModule,
  ColumnAutoSizeModule, // Fixes Error #200 (api.sizeColumnsToFit)
  ValidationModule      // Fixes Error #239 and Warnings #94 / #95
} from 'ag-grid-community';

// 2. REGISTER THEM INTO THE ACTIVE RUNTIME MATRIX
ModuleRegistry.registerModules([
  ClientSideRowModelModule, 
  PaginationModule, 
  CsvExportModule,
  ColumnAutoSizeModule, 
  ValidationModule
]);

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})


export class OrderListComponent implements OnInit {
  private gridApi!: GridApi;

  // Initial filter inputs
  filterModel = {
    fromDate: '',
    toDate: '',
    invoiceNo: '',
    waiter: '',
    tableOrRoom: '',
    orderStatus: '',
    paymentMode: '',
    paymentStatus: ''
  };

  private rawOrdersMasterList: any[] = [];
  rowData: any[] = [];
  themeClass = 'ag-theme-alpine';
  validationErrorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'SL', valueGetter: 'node.rowIndex + 1', width: 70, pinned: 'left', suppressMovable: true },
    { headerName: 'Invoice No', field: 'invoiceNo', width: 140 },
    { headerName: 'GST Invoice No', field: 'gstInvoiceNo', width: 140 },
    { 
      headerName: 'Order Date', 
      field: 'orderDate', 
      width: 160,
      valueFormatter: params => params.value ? new Date(params.value).toLocaleString() : ''
    },
    { headerName: 'Customer Name', field: 'customerName', width: 160 },
    { headerName: 'Waiter', field: 'waiterName', width: 130 },
    { headerName: 'Table/Room', field: 'tableName', width: 120 },
    { headerName: 'Pax', field: 'paxCount', width: 80, type: 'numericColumn' },
    { headerName: 'Sub Total', field: 'subTotal', width: 110, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'Discount', field: 'discount', width: 100, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'Gross Total', field: 'grossTotal', width: 120, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'CGST', field: 'cgst', width: 90, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'SGST', field: 'sgst', width: 90, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'Net Amount', field: 'netAmount', width: 130, type: 'numericColumn', cellStyle: { 'font-weight': 'bold', 'color': '#1e3a8a' }, valueFormatter: p => this.currencyFormatter(p.value) },
    { headerName: 'Received Amount', field: 'receivedAmount', width: 130, type: 'numericColumn', valueFormatter: p => this.currencyFormatter(p.value) },
    { 
      headerName: 'Order Status', 
      field: 'orderStatus', 
      width: 130,
      cellRenderer: (params: any) => {
        const val = params.value || 'Pending';
        let badge = 'status-pending';
        if (val === 'Completed' || val === 'Settled') badge = 'status-completed';
        if (val === 'Processing') badge = 'status-processing';
        return `<span class="grid-badge ${badge}">${val}</span>`;
      }
    },
    { headerName: 'Payment Mode', field: 'paymentMode', width: 130 }
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true, minWidth: 60 };

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadAllOrdersFromServer();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }, 200);
  }

  loadAllOrdersFromServer(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        const payload = Array.isArray(data) ? data : [];
        this.rawOrdersMasterList = payload.map(o => {
          const totalVal = o.totalAmount || o.price || 0;
          const calculatedSub = totalVal / 1.05;
          const splitTax = (totalVal - calculatedSub) / 2;

          return {
            invoiceNo: o.id ? `INV-${o.id.toString().substring(0, 6).toUpperCase()}` : 'N/A',
            gstInvoiceNo: o.gstInvoiceNo || `GST-${Math.floor(100000 + Math.random() * 900000)}`,
            orderDate: o.createdAt || o.orderDate || new Date(),
            customerName: o.customerName || 'Walk-In Customer',
            waiterName: o.waiterName || 'Staff Alpha',
            tableName: o.tableNumber ? `Table ${o.tableNumber.toString().padStart(2, '0')}` : 'Take Away',
            paxCount: o.pax || 1,
            subTotal: calculatedSub,
            discount: 0,
            grossTotal: totalVal,
            cgst: splitTax,
            sgst: splitTax,
            netAmount: totalVal,
            receivedAmount: totalVal,
            orderStatus: o.status || 'Pending',
            paymentMode: o.paymentMode || 'Cash'
          };
        });
        this.searchQueryFilters(); 
      },
      error: (err) => {
        console.error('Error fetching data from API:', err);
        // Display fallback instructions if server rejects credentials with 401 Unauthorized
        if (err.status === 401) {
          this.validationErrorMessage = '🔒 Session unauthorized. Please log into the app again to refresh your access token.';
        } else {
          this.validationErrorMessage = '⚠️ Failed to connect to order endpoint. Please check your service layer connection.';
        }
        this.rowData = [];
      }
    });
  }

  searchQueryFilters(): void {
  this.validationErrorMessage = null;

  // 👉 FIXED: If both dates are empty, don't show an error; just skip date filtering and show everything
  if (!this.filterModel.fromDate && !this.filterModel.toDate) {
    this.rowData = [...this.rawOrdersMasterList];
    
    // Still apply text filters if any are filled out
    this.applyTextAndDropdownFilters();
    return;
  }

  // If only one date is provided, ask for both
  if (!this.filterModel.fromDate || !this.filterModel.toDate) {
    this.validationErrorMessage = '⚠️ Missing Required Criteria: Please supply both a From Date and a To Date.';
    this.rowData = [];
    return;
  }

  const fromDateObj = new Date(this.filterModel.fromDate);
  const toDateObj = new Date(this.filterModel.toDate);

  if (fromDateObj > toDateObj) {
    this.validationErrorMessage = '⚠️ Invalid Date Constraint: "From Date" cannot be later than your selected "To Date".';
    this.rowData = [];
    return;
  }

  // Filter by Date range + Text filters
  this.rowData = this.rawOrdersMasterList.filter(o => {
    const currentRecordTime = new Date(o.orderDate).setHours(0,0,0,0);
    const startThreshold = new Date(this.filterModel.fromDate).setHours(0,0,0,0);
    const endThreshold = new Date(this.filterModel.toDate).setHours(23,59,59,999);

    if (currentRecordTime < startThreshold || currentRecordTime > endThreshold) {
      return false;
    }

    return this.evaluateTextFilters(o);
  });
}

// 🛠️ Helper method to clean up filter evaluation
private applyTextAndDropdownFilters(): void {
  this.rowData = this.rowData.filter(o => this.evaluateTextFilters(o));
}

// 🛠️ Helper method to check text criteria
private evaluateTextFilters(o: any): boolean {
  const searchInv = this.filterModel.invoiceNo ? this.filterModel.invoiceNo.toString().trim().toLowerCase() : '';
  const searchWaiter = this.filterModel.waiter ? this.filterModel.waiter.toString().trim().toLowerCase() : '';
  const searchTable = this.filterModel.tableOrRoom ? this.filterModel.tableOrRoom.toString().trim().toLowerCase() : '';

  if (searchInv && !o.invoiceNo.toLowerCase().includes(searchInv)) return false;
  if (searchWaiter && !o.waiterName.toLowerCase().includes(searchWaiter)) return false;
  if (searchTable && !o.tableName.toLowerCase().includes(searchTable)) return false;

  if (this.filterModel.orderStatus && o.orderStatus !== this.filterModel.orderStatus) return false;
  if (this.filterModel.paymentMode && o.paymentMode !== this.filterModel.paymentMode) return false;

  return true;
}


  resetGridFilters(): void {
    this.filterModel = {
      fromDate: '',
      toDate: '',
      invoiceNo: '',
      waiter: '',
      tableOrRoom: '',
      orderStatus: '',
      paymentMode: '',
      paymentStatus: ''
    };
    this.validationErrorMessage = null;
    this.rowData = []; 
  }

  exportExcelPayload(): void {
    if (this.gridApi && this.rowData.length > 0) {
      this.gridApi.exportDataAsCsv({ 
        fileName: `Master_Orders_Ledger_${new Date().toISOString().split('T')[0]}.csv` 
      });
    } else {
      alert('Action blocked: No matching data logs are visible in the layout view to export.');
    }
  }

  private currencyFormatter(value: number): string {
    if (value === undefined || value === null) return '$0.00';
    return '$' + value.toFixed(2);
  }
}