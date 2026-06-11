import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

// ... (imports remain the same)

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
              <span>{{ item.quantity }} x \${{ item.price.toFixed(2) }}</span>
              <span><strong>\${{ (item.quantity * item.price).toFixed(2) }}</strong></span>
            </div>
          </div>
          <div class="total-row">
            <strong>Total:</strong>
            <strong>\${{ getTotal().toFixed(2) }}</strong>
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
  styles: [`/* styles remain identical */`]
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
    // FIX: Using index notation to satisfy 'noPropertyAccessFromIndexSignature'
    if (state && state['items']) {
      this.orderItems = state['items'];
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
      // FIX: string casting to match CreateOrderRequest type expectations
      tableId: this.selectedTableId.toString(),
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