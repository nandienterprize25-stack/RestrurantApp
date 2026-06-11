import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Order } from '../../models';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

// ... (imports remain the same)

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container">
      <header class="header">
        <h1>My Orders</h1>
        <div class="nav-buttons">
          <button class="btn-menu" (click)="goToMenu()">Menu</button>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="content">
        <div *ngIf="orders.length === 0" class="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button (click)="goToMenu()">Browse Menu</button>
        </div>

        <div *ngIf="orders.length > 0" class="orders-list">
          <div *ngFor="let order of orders" class="order-card">
            <div class="order-header">
              <div>
                <h3>Order #{{ order.id | slice:0:8 }}</h3>
                <p class="order-date">{{ order.createdAt | date: 'short' }}</p>
              </div>
              <span [class]="'status ' + (order.status | lowercase)">
                {{ order.status }}
              </span>
            </div>

            <div class="order-details">
              <p><strong>Table:</strong> {{ order.tableNumber }}</p>
              <p><strong>Total:</strong> \${{ order.totalAmount.toFixed(2) }}</p>
              <p><strong>Items:</strong> {{ order.items.length }}</p>
            </div>

            <div class="order-items">
              <div *ngFor="let item of order.items" class="item">
                <span>{{ item.menuItemName }} x {{ item.quantity }}</span>
                <span>\${{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <div class="order-actions">
              <button class="btn-pdf" (click)="downloadPdf(order.id)">Download PDF</button>
              <button class="btn-excel" (click)="downloadExcel(order.id)">Download Excel</button>
              <button class="btn-csv" (click)="downloadCsv(order.id)">Download CSV</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
 styles: [`
    .orders-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-buttons {
      display: flex;
      gap: 10px;
    }

    .btn-menu, .btn-logout {
      padding: 10px 20px;
      border: 1px solid white;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 5px;
      cursor: pointer;
    }

    .content {
      padding: 40px;
      flex: 1;
    }

    .no-orders {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
    }

    .no-orders button {
      margin-top: 20px;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .orders-list {
      display: grid;
      gap: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .order-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
    }

    .order-header h3 {
      margin: 0;
    }

    .order-date {
      color: #999;
      font-size: 12px;
      margin: 5px 0 0;
    }

    .status {
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .status.new {
      background: #e3f2fd;
      color: #1976d2;
    }

    .status.inprogress {
      background: #fff3e0;
      color: #f57c00;
    }

    .status.completed {
      background: #e8f5e9;
      color: #388e3c;
    }

    .status.cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .order-details {
      display: flex;
      gap: 30px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .order-details p {
      margin: 0;
    }

    .order-items {
      background: #f9f9f9;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 15px;
    }

    .item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .order-actions {
      display: flex;
      gap: 10px;
    }

    .btn-pdf, .btn-excel, .btn-csv {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-pdf {
      background: #f44336;
      color: white;
    }

    .btn-excel {
      background: #4caf50;
      color: white;
    }

    .btn-csv {
      background: #2196f3;
      color: white;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data: any) => {
        this.orders = data;
      },
      error: (err) => console.error('Error loading orders', err)
    });
  }

  downloadPdf(orderId: string) {
    this.orderService.downloadPdf(orderId).subscribe({
      next: (blob) => this.downloadFile(blob, `order-${orderId}.pdf`),
      error: (err) => console.error('Error downloading PDF', err)
    });
  }

  downloadExcel(orderId: string) {
    this.orderService.downloadExcel(orderId).subscribe({
      next: (blob) => this.downloadFile(blob, `order-${orderId}.xlsx`),
      error: (err) => console.error('Error downloading Excel', err)
    });
  }

  downloadCsv(orderId: string) {
    this.orderService.downloadCsv(orderId).subscribe({
      next: (blob) => this.downloadFile(blob, `order-${orderId}.csv`),
      error: (err) => console.error('Error downloading CSV', err)
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  goToMenu() {
    this.router.navigate(['/menu']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
