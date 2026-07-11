import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FoodBookingItem, BookedMenuItem } from '../../../models/reservation.model';

@Component({
  selector: 'app-food-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './food-booking.component.html',
  styleUrls: ['../reservation.css'] // 👈 FIX: Points to shared stylesheet instead of missing local file
})
export class FoodBookingComponent implements OnInit {
  @ViewChild('bookingModal') bookingModal!: TemplateRef<any>;

  searchBookingNo: string = '';
  searchPhoneNo: string = '';
  searchStatus: string = '';

  foodBookings: FoodBookingItem[] = [];
  filteredBookings: FoodBookingItem[] = [];

  currentBooking: any = this.getEmptyBookingState();
  tempItem: any = this.getEmptyItemState();
  bookedItems: BookedMenuItem[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMockBookings();
  }

  loadMockBookings(): void {
    this.foodBookings = [
      { 
        id: 1, 
        sl: 1, 
        bookingDate: '2026-07-11', 
        bookingNo: 'BK-9942', 
        bookedBy: 'Admin', 
        roomNo: '201', 
        guestName: 'John Doe', 
        phoneNo: '9000000000', 
        orderedAmount: 165.00, 
        status: 'Completed', 
        orderStatus: 'Completed', 
        category: 'LUNCH' 
      }
    ];
    this.filteredBookings = [...this.foodBookings];
  }

  onSearch(): void {
    this.filteredBookings = this.foodBookings.filter(b => {
      return (!this.searchBookingNo || b.bookingNo.includes(this.searchBookingNo)) &&
             (!this.searchPhoneNo || b.phoneNo.includes(this.searchPhoneNo)) &&
             (!this.searchStatus || b.status === this.searchStatus);
    });
  }

  onReset(): void {
    this.searchBookingNo = '';
    this.searchPhoneNo = '';
    this.searchStatus = '';
    this.filteredBookings = [...this.foodBookings];
  }

  openBookingPopup(booking?: FoodBookingItem): void {
    if (booking) {
      this.currentBooking = { ...booking, customerName: booking.guestName, customerPhone: booking.phoneNo };
      this.bookedItems = [{ 
        id: 1, 
        sl: 1, 
        date: booking.bookingDate, 
        room: booking.roomNo, 
        category: booking.category || 'LUNCH', 
        menu: 'Peeli Dal', 
        qty: 1, 
        total: booking.orderedAmount 
      }];
    } else {
      this.currentBooking = this.getEmptyBookingState();
      this.bookedItems = [];
    }
    this.dialog.open(this.bookingModal, { width: '950px', disableClose: true });
  }

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
      const nextId = this.bookedItems.length + 1;
      this.bookedItems.push({
        id: nextId,
        sl: nextId,
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
    this.dialog.closeAll();
  }

  deleteBooking(sl: number): void {
    if(confirm('Are you sure you want to drop this order record?')) {
      this.foodBookings = this.foodBookings.filter(b => b.sl !== sl);
      this.onSearch();
    }
  }

  private getEmptyBookingState() {
    return { bookingDate: new Date().toISOString().split('T')[0], customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', sameAsCustomer: false, guestName: '', guestPhone: '', guestEmail: '', paymentDate: '', paymentMode: '', advancedAmount: 0, orderedAmount: 0, status: 'Pending' };
  }

  private getEmptyItemState() {
    return { date: new Date().toISOString().split('T')[0], room: '', category: '', menu: '', qty: 1, total: 0 };
  }
} // 👈 Typo character 's' safely removed here!