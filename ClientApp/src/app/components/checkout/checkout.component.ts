import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-container">
      <header class="header">
        <h1>Checkout</h1>
        <button class="btn-back" (click)="goBack()">← Back to Menu</button>
      </header>

      <div class="content">
        <div class="order-items">
          <h2>Order Summary</h2>
          <div class="items-list">
            <div *ngFor="let item of orderItems" class="item-row">
              <span>{{ item.name }}</span>
              <span>{{ item.quantity }} x ${{ item.price.toFixed(2) }}</span>
              <span><strong>${{ (item.quantity * item.price).toFixed(2) }}</strong></span>
            </div>
          </div>
          <div class="total-row">
            <strong>Total:</strong>
            <strong>${{ getTotal().toFixed(2) }}</strong>
          </div>
        </div>

        <div class="checkout-form">
          <h2>Complete Your Order</h2>
          <div class="form-group">
            <label>Table Number *</label>
            <input 
              type="number" 
              [(ngModel)]="selectedTableId" 
              placeholder="Enter table number"
              class="form-control" />
          </div>

          <div class="form-group">
            <label>Special Instructions</label>
            <textarea 
              [(ngModel)]="specialInstructions"
              placeholder="Any special instructions?"
              class="form-control"
              rows="4"></textarea>
          </div>

          <button 
            class="btn-submit" 
            (click)="placeOrder()"
            [disabled]="!selectedTableId || isProcessing">
            {{ isProcessing ? 'Processing...' : 'Place Order' }}
          </button>

          <div *ngIf="successMessage" class="success">
            {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="error">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
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

    .btn-back {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }

    .content {
      display: flex;
      gap: 40px;
      padding: 40px;
      flex: 1;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .order-items,
    .checkout-form {
      flex: 1;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .items-list {
      margin-bottom: 20px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      border-top: 2px solid #667eea;
      font-size: 18px;
      margin-top: 10px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success {
      margin-top: 15px;
      padding: 12px;
      background: #d4edda;
      color: #155724;
      border-radius: 5px;
      text-align: center;
    }

    .error {
      margin-top: 15px;
      padding: 12px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 5px;
      text-align: center;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  orderItems: any[] = [];
  selectedTableId: number | null = null;
  specialInstructions = '';
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state?.items) {
      this.orderItems = state.items;
    }
  }

  getTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  placeOrder() {
    if (!this.selectedTableId) {
      this.errorMessage = 'Please select a table number';
      return;
    }

    this.isProcessing = true;
    const orderRequest = {
      tableId: this.selectedTableId,
      items: this.orderItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Order placed successfully!';
        setTimeout(() => {
          this.router.navigate(['/menu']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to place order';
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/menu']);
  }
}
