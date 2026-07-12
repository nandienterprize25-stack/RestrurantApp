import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, ReservationDto } from '../../../services/reservation.service';

@Component({
  selector: 'app-take-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-order.component.html',
  styleUrls: ['../reservation.css']
})
export class TakeOrderComponent {
  private backendService = inject(ReservationService);

  currentBooking: any = this.getEmptyBookingState();
  tempItem: any = this.getEmptyItemState();

  // Inside your TakeOrderComponent class, make sure this getter property helper is present:
get bookedItems(): any[] {
  return this.currentBooking?.items || [];
}

  syncGuestDetails(): void {
    if (this.currentBooking.sameAsCustomer) {
      this.currentBooking.guestName = this.currentBooking.customerName;
      this.currentBooking.guestPhone = this.currentBooking.phoneNo;
      this.currentBooking.guestEmail = this.currentBooking.customerEmail;
    }
  }

  addItem(): void {
    if (this.tempItem.menuName && this.tempItem.qty > 0) {
      this.tempItem.total = this.tempItem.qty * 165;
      this.tempItem.sl = this.currentBooking.items.length + 1;
      this.currentBooking.items.push({ ...this.tempItem });
      this.calculateGrandTotal();
      this.tempItem = this.getEmptyItemState();
    }
  }

  removeItem(index: number): void {
    this.currentBooking.items.splice(index, 1);
    this.calculateGrandTotal();
  }

  calculateGrandTotal(): void {
    this.currentBooking.totalAmount = this.currentBooking.items.reduce((acc: number, curr: any) => acc + curr.total, 0);
  }

  saveBooking(): void {
    this.backendService.upsertReservation(this.currentBooking).subscribe({
      next: () => {
        alert('Walk-In/Take Order entry dispatched and recorded successfully!');
        this.currentBooking = this.getEmptyBookingState();
      }
    });
  }

  private getEmptyBookingState() {
    return { bookingDate: new Date().toISOString().split('T')[0], customerName: '', phoneNo: '', customerEmail: '', customerAddress: '', sameAsCustomer: false, guestName: '', guestPhone: '', guestEmail: '', paymentDate: '', paymentMode: 'Cash', advancedAmount: 0, totalAmount: 0, status: 'Completed', type: 'TakeOrder', items: [] };
  }

  private getEmptyItemState() {
    return { date: new Date().toISOString().split('T')[0], roomNo: '', category: 'LUNCH', menuName: '', qty: 1, total: 0 };
  }
}