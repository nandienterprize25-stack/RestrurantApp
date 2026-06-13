import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-kitchen-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-display.component.html',
  styleUrls: ['./kitchen-display.component.css']
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  activeKitchenOrders: any[] = [];
  private pollingIntervalId: any;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchIncomingOrders();
    // Set up a lightweight polling engine to fetch new live tickets every 15 seconds
    this.pollingIntervalId = setInterval(() => this.fetchIncomingOrders(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
  }

  fetchIncomingOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        const ordersArray = Array.isArray(data) ? data : (data && (data as any).items ? (data as any).items : []);
        // KDS only needs to display active processing back-of-house tickets
        this.activeKitchenOrders = ordersArray.filter(
          (o: any) => o.status === 'Pending' || o.status === 'Processing'
        );
      },
      error: (err) => console.error('Error syncing KDS board orders:', err)
    });
  }

  advanceTicketStatus(orderId: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'Pending' ? 'Processing' : 'Completed';
    
    this.orderService.updateOrderStatus(orderId, nextStatus).subscribe({
      next: () => {
        this.fetchIncomingOrders(); // Instantly refresh the board layout matrix
      },
      error: (err) => console.error('Error bumping kitchen ticket state:', err)
    });
  }

  getElapsedTimeMinutes(dateString: string): number {
    const orderTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    return Math.floor((now - orderTime) / 60000);
  }
}