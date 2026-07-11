import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookedMenuItem } from '../../../models/reservation.model';

@Component({
  selector: 'app-take-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-order.component.html',
  styleUrls: ['../reservation.css']
})
export class TakeOrderComponent implements OnInit {
  currentBooking: any = this.getEmptyBookingState();
  tempItem: any = this.getEmptyItemState();
  bookedItems: BookedMenuItem[] = [];

  ngOnInit(): void {}

  syncGuestDetails(): void {
    if (this.currentBooking.sameAsCustomer) {
      this.currentBooking.guestName = this.currentBooking.customerName;
      this.currentBooking.guestPhone = this.currentBooking.customerPhone;
      this.currentBooking.guestEmail = this.currentBooking.customerEmail;
    }
  }

  addItem(): void {
    if (this.tempItem.menu && this.tempItem.qty > 0) {
      this.tempItem.total = this.tempItem.qty * 165;
      this.bookedItems.push({
        sl: this.bookedItems.length + 1,
        ...this.tempItem
      });
      this.calculateGrandTotal();
      this.tempItem = this.getEmptyItemState();
    }
  }

  removeItem(index: number): void {
    this.bookedItems.splice(index, 1);
    this.calculateGrandTotal();
  }

  calculateGrandTotal(): void {
    this.currentBooking.orderedAmount = this.bookedItems.reduce((acc, curr) => acc + curr.total, 0);
  }

  saveBooking(): void {
    console.log('Order pipeline dispatched successfully:', this.currentBooking, this.bookedItems);
    alert('Food Order Entry Locked Successfully!');
    this.currentBooking = this.getEmptyBookingState();
    this.bookedItems = [];
  }

  private getEmptyBookingState() {
    return { bookingDate: new Date().toISOString().split('T')[0], customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', sameAsCustomer: false, guestName: '', guestPhone: '', guestEmail: '', paymentDate: '', paymentMode: '', advancedAmount: 0, orderedAmount: 0, status: 'Pending' };
  }

  private getEmptyItemState() {
    return { date: new Date().toISOString().split('T')[0], room: '', category: '', menu: '', qty: 1, total: 0 };
  }
}