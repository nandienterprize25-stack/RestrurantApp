import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationService, ReservationDto } from '../../../services/reservation.service';
import { CustomAlertService } from '../../../services/custom-alert.service';

@Component({
  selector: 'app-food-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './food-booking.component.html',
  styleUrls: ['../reservation.css']
})
export class FoodBookingComponent implements OnInit {
  @ViewChild('bookingModal') bookingModal!: TemplateRef<any>;

  private dialog = inject(MatDialog);
  private alertService = inject(CustomAlertService);
  private backendService = inject(ReservationService);

  searchBookingNo: string = '';
  searchPhoneNo: string = '';
  searchStatus: string = '';

  bookingsList: any[] = [];
  filteredBookings: any[] = [];

  currentBooking: any = this.getEmptyBookingState();
  tempItem: any = this.getEmptyItemState();
  
  // 🌟 FIX: Expose bookedItems array to satisfy template rendering loop context
  get bookedItems(): any[] {
    return this.currentBooking?.items || [];
  }

  isEditingMode: boolean = false;

  // ngOnInit(): void {
  //   this.loadBackendData();
  // }
  // 1. Add tracking arrays at the top of your class definitions
categoriesList: any[] = [];
menuItemsList: any[] = [];
filteredMenuItems: any[] = []; // To hold items filtering by chosen category

ngOnInit(): void {
  this.loadBackendData();
  this.loadDropdownData(); // 🌟 Load dropdown data on startup
}

loadDropdownData(): void {
  // Fetch real database categories
  this.backendService.getCategories().subscribe({
    next: (data) => this.categoriesList = data,
    error: (err) => console.error('Error fetching categories', err)
  });

  // Fetch all active menu items
  this.backendService.getMenuItems().subscribe({
    next: (data) => {
      this.menuItemsList = data;
      this.filteredMenuItems = data; // Default fallback
    },
    error: (err) => console.error('Error fetching menus', err)
  });
}

// 🌟 Run this when the user picks a different category drop-down option
onCategoryChange(selectedCategoryName: string): void {
  if (!selectedCategoryName) {
    this.filteredMenuItems = this.menuItemsList;
    return;
  }
  
  // Filter menu items matching the picked category string matching rules
  this.filteredMenuItems = this.menuItemsList.filter(item => 
    item.category?.toUpperCase() === selectedCategoryName.toUpperCase() ||
    item.categoryName?.toUpperCase() === selectedCategoryName.toUpperCase()
  );
  
  // Reset selected item choice input state
  this.tempItem.menuName = '';
}

  loadBackendData(): void {
    this.backendService.getReservationsByType('FoodBooking').subscribe({
      next: (data) => {
        // 🌟 Map missing structural template property tracking labels dynamically
        this.bookingsList = data.map(b => ({
          ...b,
          bookingNo: `BK-${b.sl || 1000}`,
          bookedBy: 'System Admin',
          roomNo: b.items?.[0]?.roomNo || 'N/A',
          orderedAmount: b.totalAmount
        }));
        this.filteredBookings = [...this.bookingsList];
      }
    });
  }

  onSearch(): void {
    this.filteredBookings = this.bookingsList.filter(b => {
      return (!this.searchPhoneNo || b.phoneNo?.includes(this.searchPhoneNo)) &&
             (!this.searchStatus || b.status === this.searchStatus);
    });
  }

  onReset(): void {
    this.searchBookingNo = '';
    this.searchPhoneNo = '';
    this.searchStatus = '';
    this.filteredBookings = [...this.bookingsList];
  }

  // Add these flags inside your class definitions near the top of your properties
formSubmitted: boolean = false;
itemSubmitted: boolean = false;

// Update your popup layout visibility resets inside openBookingPopup()
openBookingPopup(booking?: any): void {
  this.formSubmitted = false;   // Reset validation errors visibility flags
  this.itemSubmitted = false;   // Reset tracking states
  
  if (booking) {
    this.isEditingMode = true;
    this.currentBooking = { ...booking };
  } else {
    this.isEditingMode = false;
    this.currentBooking = this.getEmptyBookingState();
  }
  
  this.dialog.open(this.bookingModal, { 
    width: '100vw', height: '100vh', maxWidth: '100vw',
    panelClass: 'fullscreen-dialog-pane', disableClose: true 
  });
}

addItem(): void {
  this.itemSubmitted = true; // Turn on inline structural visual errors if empty

  // Form Validation check constraints
  if (!this.tempItem.date || !this.tempItem.roomNo || !this.tempItem.category || !this.tempItem.menuName || !this.tempItem.qty || this.tempItem.qty <= 0) {
    return; // Exit silently. The validation messages are now visibly shown inline.
  }

  const selectedDish = this.filteredMenuItems.find(
    dish => (dish.name || dish.foodItemName) === this.tempItem.menuName
  );
  const unitPrice = selectedDish ? selectedDish.price : 0;

  this.tempItem.total = this.tempItem.qty * unitPrice;
  this.tempItem.sl = this.currentBooking.items.length + 1;
  
  this.currentBooking.items.push({ ...this.tempItem });
  this.calculateGrandTotal();
  
  this.tempItem = this.getEmptyItemState();
  this.itemSubmitted = false; // Reset row validation tracker flag safely
}

saveBooking(): void {
  this.formSubmitted = true; // Flag the form to evaluate template CSS rules

  // Structural checks: Customer Profiles info matching validation metrics
  if (!this.currentBooking.bookingDate || !this.currentBooking.customerName || !this.currentBooking.phoneNo) {
    this.alertService.show({ type: 'warning', title: 'Invalid Fields', message: 'Please fix all flagged required inputs inside the worksheet.' });
    return;
  }

  // Structural checks: Alternate guest detail criteria
  if (!this.currentBooking.sameAsCustomer) {
    if (!this.currentBooking.guestName || !this.currentBooking.guestPhone) {
      this.alertService.show({ type: 'warning', title: 'Invalid Fields', message: 'Please provide guest information parameters.' });
      return;
    }
  }

  // Structural checks: Empty table array verification details
  if (!this.currentBooking.items || this.currentBooking.items.length === 0) {
    this.alertService.show({ type: 'warning', title: 'Table Empty', message: 'Please allocate items into the tracking ledger grid.' });
    return;
  }

  this.backendService.upsertReservation(this.currentBooking).subscribe({
    next: () => {
      this.loadBackendData();
      this.dialog.closeAll();
      this.alertService.show({
        type: 'success', title: 'Success', message: this.isEditingMode ? 'Updates saved.' : 'Allocation added.'
      });
    }
  });
}
  syncGuestDetails(): void {
    if (this.currentBooking.sameAsCustomer) {
      this.currentBooking.guestName = this.currentBooking.customerName;
      this.currentBooking.phoneNo = this.currentBooking.phoneNo;
      this.currentBooking.guestEmail = this.currentBooking.customerEmail;
    }
  }

  
  // Inside your food-booking.component.ts class file



  removeItem(index: number): void {
    this.currentBooking.items.splice(index, 1);
    this.calculateGrandTotal();
  }

  calculateGrandTotal(): void {
    this.currentBooking.totalAmount = this.currentBooking.items.reduce((acc: number, curr: any) => acc + curr.total, 0);
  }

  // 🌟 FIX: Accept string or number identifiers safely without type friction
  deleteBooking(slId: any): void {
    const targetId = this.bookingsList.find(x => x.sl === slId || x.id === slId)?.id;
    if (!targetId) return;

    this.alertService.show({
      type: 'warning', title: 'Confirm Delete', message: 'Scrub this order record permanently?', showCancel: true,
      onConfirm: () => {
        this.backendService.deleteReservation(targetId).subscribe({
          next: () => {
            this.loadBackendData();
            this.alertService.show({ type: 'success', title: 'Dropped', message: 'Record cleared.' });
          }
        });
      }
    });
  }

  
  private getEmptyBookingState() {
    return { 
      bookingDate: new Date().toISOString().split('T')[0], 
      customerName: '', phoneNo: '', customerEmail: '', customerAddress: '', 
      sameAsCustomer: false, guestName: '', guestPhone: '', guestEmail: '', 
      paymentDate: '', paymentMode: '', advancedAmount: 0, totalAmount: 0, 
      status: 'Pending', type: 'FoodBooking', items: [] 
    };
  }

  private getEmptyItemState() {
    return { date: new Date().toISOString().split('T')[0], roomNo: '', category: 'LUNCH', menuName: '', qty: 1, total: 0 };
  }
}