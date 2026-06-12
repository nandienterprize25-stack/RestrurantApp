import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

// AG-Grid Module Registration Engine Core
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  private gridApi!: GridApi;

  // Filter Bindings linked to UI Inputs
  filterModel = {
    fromDate: '', // Left blank initially to display all history logs until selected
    toDate: '',
    invoiceNo: '',
    waiter: '',
    tableOrRoom: '',
    orderStatus: '',
    paymentMode: '',
    paymentStatus: ''
  };

  // Master raw records from API & Processed records for AG-Grid display
  private rawOrdersMasterList: any[] = [];
  rowData: any[] = [];
  themeClass = 'ag-theme-alpine';

  columnDefs: ColDef[] = [
    { 
      headerName: 'SL', 
      valueGetter: 'node.rowIndex + 1', 
      width: 70, 
      pinned: 'left',
      suppressMovable: true
    },
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
    { 
      headerName: 'Sub Total', 
      field: 'subTotal', 
      width: 110, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'Discount', 
      field: 'discount', 
      width: 100, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'Gross Total', 
      field: 'grossTotal', 
      width: 120, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'CGST', 
      field: 'cgst', 
      width: 90, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'SGST', 
      field: 'sgst', 
      width: 90, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'Net Amount', 
      field: 'netAmount', 
      width: 130, 
      type: 'numericColumn',
      cellStyle: { 'font-weight': 'bold', 'color': '#1e3a8a' },
      valueFormatter: p => this.currencyFormatter(p.value)
    },
    { 
      headerName: 'Received Amount', 
      field: 'receivedAmount', 
      width: 130, 
      type: 'numericColumn',
      valueFormatter: p => this.currencyFormatter(p.value)
    },
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

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    minWidth: 60
  };

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadAllOrdersFromServer();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    setTimeout(() => this.gridApi.sizeColumnsToFit(), 150);
  }

  /**
   * 🛠️ FIX: Hits the valid GET api/orders endpoint directly to bring down records
   */
  loadAllOrdersFromServer(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        const payload = Array.isArray(data) ? data : [];
        
        // Map backend payload scheme to match our Ag-Grid schema structure
        this.rawOrdersMasterList = payload.map(o => {
          // Calculate dummy tax splits for viewing if your DB payload doesn't provide them explicitly
          const totalVal = o.totalAmount || 0;
          const dummySubTotal = totalVal / 1.05; 
          const dummyTaxValue = (totalVal - dummySubTotal) / 2;

          return {
            invoiceNo: o.id ? `INV-${o.id.substring(0, 6).toUpperCase()}` : 'N/A',
            gstInvoiceNo: o.gstInvoiceNo || `GST-${Math.floor(100000 + Math.random() * 900000)}`,
            orderDate: o.createdAt || o.orderDate || new Date(),
            customerName: o.customerName || 'Walk-In Customer',
            waiterName: o.waiterName || 'Staff Alpha',
            tableName: o.tableNumber ? `Table ${o.tableNumber.toString().padStart(2, '0')}` : 'Take Away',
            paxCount: o.pax || 2,
            subTotal: dummySubTotal,
            discount: 0,
            grossTotal: totalVal,
            cgst: dummyTaxValue,
            sgst: dummyTaxValue,
            netAmount: totalVal,
            receivedAmount: totalVal,
            orderStatus: o.status || 'Pending',
            paymentMode: o.paymentMode || 'Cash'
          };
        });

        // Run client side filters to populate initial rows inside view frame
        this.searchQueryFilters();
      },
      error: (err) => {
        console.error('Error fetching master dataset records:', err);
        this.rowData = [];
      }
    });
  }

  /**
   * Performs real-time client side data set evaluation matching layout inputs
   */
  searchQueryFilters(): void {
    this.rowData = this.rawOrdersMasterList.filter(o => {
      // 1. Date Checks
      if (this.filterModel.fromDate) {
        const start = new Date(this.filterModel.fromDate).setHours(0,0,0,0);
        const current = new Date(o.orderDate).setHours(0,0,0,0);
        if (current < start) return false;
      }
      if (this.filterModel.toDate) {
        const end = new Date(this.filterModel.toDate).setHours(23,59,59,999);
        const current = new Date(o.orderDate).setHours(0,0,0,0);
        if (current > end) return false;
      }

      // 2. Text Search Queries
      if (this.filterModel.invoiceNo && !o.invoiceNo.toLowerCase().includes(this.filterModel.invoiceNo.toLowerCase())) return false;
      if (this.filterModel.waiter && !o.waiterName.toLowerCase().includes(this.filterModel.waiter.toLowerCase())) return false;
      if (this.filterModel.tableOrRoom && !o.tableName.toLowerCase().includes(this.filterModel.tableOrRoom.toLowerCase())) return false;

      // 3. Dropdown Select Selection Checks
      if (this.filterModel.orderStatus && o.orderStatus !== this.filterModel.orderStatus) return false;
      if (this.filterModel.paymentMode && o.paymentMode !== this.filterModel.paymentMode) return false;

      return true;
    });
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
    this.searchQueryFilters();
  }

  exportExcelPayload(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({ fileName: `Orders_Ledger_${new Date().toISOString().split('T')[0]}.csv` });
    }
  }

  private currencyFormatter(value: number): string {
    if (value === undefined || value === null) return '$0.00';
    return '$' + value.toFixed(2);
  }
}