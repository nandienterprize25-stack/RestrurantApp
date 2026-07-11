import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodBookingItem, BookedMenuItem, DiningTableReservation, UnavailabilityRecord } 
from '../../../models/reservation.model';

@Component({
  selector: 'app-reservation-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-dashboard.component.html',
  styleUrls: ['./reservation-dashboard.component.css']
})
export class ReservationDashboardComponent implements OnInit {
  // Navigation State Switcher 
  activeSubView: 'food-booking' | 'take-order' | 'reservations' | 'unavailability' | 'settings' = 'food-booking';

  // Filter Models Hub
  filters = { foodBookingNo: '', foodPhone: '', foodStatus: '' };
  globalSearchQueryText: string = '';

  // Data Collections Hub Arrays
  foodBookings: FoodBookingItem[] = [];
  masterReservations: DiningTableReservation[] = [];
  filteredReservations: DiningTableReservation[] = [];
  unavailabilityList: UnavailabilityRecord[] = [];

  // Sub-Form Control Models
  orderForm: any = {
    bookingDate: '2026-07-11', customerName: '', customerPhone: '', customerEmail: '',
    customerAddress: '', sameAsCustomer: false, guestName: '', guestPhone: '', guestEmail: '',
    paymentDate: '', paymentMode: 'Cash', advancedAmount: 0
  };

  itemSelector = { date: '2026-07-11', room: 'Room 201', category: 'LUNCH', menu: 'Peeli Dal', qty: 1, total: 165.00 };
  orderBookedItemsList: BookedMenuItem[] = [];
  orderGrossCalculatedTotal: number = 0;

  reservationSettings = { availableOn: '09:00:00', closingTime: '22:00:00', maxReservePerson: 20 };

  // Modals Framework Visibility Flags
  isFoodBookingModalOpen: boolean = false;
  editingFoodBookingRowItem: FoodBookingItem | null = null;
  modalFoodBookingPayload: any = {};

  isReservationFormDialogOpen: boolean = false;
  newReservationFormState: any = { fromDate: '', toDate: '', guestName: '', phone: '', menu: 'Demo 1', advancedAmount: 0, totalAmount: 0 };

  isUnavailabilityModalOpen: boolean = false;
  newUnavailabilityFormState: any = { date: '2026-07-11', startTime: '', endTime: '', status: 'Active' };

  ngOnInit(): void {
    this.seedMockDatabaseRecords();
    this.recomputeOrderTicketGrossTotals();
  }

  private seedMockDatabaseRecords(): void {
   // Ensure your food booking items array inside reservation-dashboard contains both id and sl:
  this.foodBookings = [
    { 
      id: 1, 
      sl: 1, 
      bookingDate: '16-05-2026', 
      bookingNo: 'BK-4091', 
      bookedBy: 'Admin', 
      roomNo: '201', 
      guestName: 'Sarah Jenkins', 
      phoneNo: '9000000000', 
      orderedAmount: 165.00, 
      status: 'Completed', 
      orderStatus: 'Completed' 
    }
  ];

  // Ensure items pushed to orderBookedItemsList specify both id and sl fields:
  this.orderBookedItemsList.push({
    id: this.orderBookedItemsList.length + 1,
    sl: this.orderBookedItemsList.length + 1,
    date: '2026-05-16',
    room: '201',
    category: 'LUNCH',
    menu: 'Peeli Dal',
    qty: 1,
    total: 165.00
  });

    this.masterReservations = [
      { sl: 1, customerName: 'Alex Mercer', tableNo: 'T-04', numberOfPeople: 4, startTime: '19:00', endTime: '21:00', date: '2026-07-12', status: 'Active' },
      { sl: 2, customerName: 'Beatrice Vance', tableNo: 'T-12', numberOfPeople: 2, startTime: '13:00', endTime: '14:30', date: '2026-07-14', status: 'Closed' }
    ];
    this.filteredReservations = [...this.masterReservations];

    // this.orderBookedItemsList = [
    //   { id: 1, date: '2026-05-16', room: '201', category: 'LUNCH', menu: 'Peeli Dal', qty: 1, total: 165.00 }
    // ];

    this.unavailabilityList = [
      { sl: 1, unavailableDate: '2026-05-17', startTime: '14:00', endTime: '18:00', status: 'Active' }
    ];
  }

  // Business Rules Logic Engine Operations
  executeFilterSearch(): void {
    console.log('Query rules executed with parameter filters:', this.filters);
  }

  resetFilters(): void {
    this.filters = { foodBookingNo: '', foodPhone: '', foodStatus: '' };
  }

  mirrorCustomerDetails(): void {
    if (this.orderForm.sameAsCustomer) {
      this.orderForm.guestName = this.orderForm.customerName;
      this.orderForm.guestPhone = this.orderForm.customerPhone;
      this.orderForm.guestEmail = this.orderForm.customerEmail;
    }
  }

  onCategoryChange(): void {
    this.itemSelector.menu = this.itemSelector.category === 'LUNCH' ? 'Peeli Dal' : 'Truffle Burger';
    this.calculateItemLineTotal();
  }

  calculateItemLineTotal(): void {
    const basePrice = this.itemSelector.menu === 'Peeli Dal' ? 165.00 : 220.00;
    this.itemSelector.total = basePrice * (this.itemSelector.qty || 1);
  }

  addMenuItemToOrderGrid(): void {
    this.orderBookedItemsList.push({
    id: this.orderBookedItemsList.length + 1,
    sl: this.orderBookedItemsList.length + 1,
    date: '2026-05-16',
    room: '201',
    category: 'LUNCH',
    menu: 'Peeli Dal',
    qty: 1,
    total: 165.00
  });
    this.recomputeOrderTicketGrossTotals();
  }

  deleteReceiptLineItem(id: number): void {
    this.orderBookedItemsList = this.orderBookedItemsList.filter(x => x.id !== id);
    this.recomputeOrderTicketGrossTotals();
  }

  editReceiptLineItem(line: BookedMenuItem): void {
    this.itemSelector = { date: line.date, room: line.room, category: line.category, menu: line.menu, qty: line.qty, total: line.total };
  }

  private recomputeOrderTicketGrossTotals(): void {
    this.orderGrossCalculatedTotal = this.orderBookedItemsList.reduce((sum, item) => sum + item.total, 0);
  }

  commitOrderToStorageBackend(): void {
    console.log('Posting JSON manifest structure blueprint package to endpoint network streams:', { info: this.orderForm, structuralLines: this.orderBookedItemsList, rawTotal: this.orderGrossCalculatedTotal });
    alert('Take Order Entry state updated locally.');
  }

  // Modals Overlay View Manipulation Core Pipelines
  toggleFoodBookingModalState(open: boolean): void {
    this.isFoodBookingModalOpen = open;
    if (!open) this.editingFoodBookingRowItem = null;
  }

  openFoodBookingModal(): void {
    this.modalFoodBookingPayload = { sl: 0, bookingDate: '', bookingNo: '', bookedBy: '', roomNo: '', guestName: '', phoneNo: '', orderedAmount: 0, orderStatus: 'Pending' };
    this.toggleFoodBookingModalState(true);
  }

  editFoodBooking(item: FoodBookingItem): void {
    this.editingFoodBookingRowItem = item;
    this.modalFoodBookingPayload = { ...item };
    this.toggleFoodBookingModalState(true);
  }

  commitFoodBookingModalPayload(): void {
    if (this.editingFoodBookingRowItem) {
      const idx = this.foodBookings.findIndex(x => x.sl === this.modalFoodBookingPayload.sl);
      if (idx !== -1) this.foodBookings[idx] = { ...this.modalFoodBookingPayload };
    } else {
      this.modalFoodBookingPayload.sl = this.foodBookings.length + 1;
      this.foodBookings.push({ ...this.modalFoodBookingPayload });
    }
    this.toggleFoodBookingModalState(false);
  }

  deleteFoodBooking(sl: number): void {
    this.foodBookings = this.foodBookings.filter(x => x.sl !== sl);
  }

  toggleReservationFormDialog(open: boolean): void {
    this.isReservationFormDialogOpen = open;
  }

  commitTableReservationFormEntry(): void {
    this.masterReservations.push({
      sl: this.masterReservations.length + 1,
      customerName: this.newReservationFormState.guestName || 'Walk-In Customer',
      tableNo: 'T-Dynamic',
      numberOfPeople: 2,
      startTime: '18:00',
      endTime: '20:00',
      date: this.newReservationFormState.fromDate || '2026-07-11',
      status: 'Active'
    });
    this.filterReservationsGlobalTable();
    this.toggleReservationFormDialog(false);
  }

  filterReservationsGlobalTable(): void {
    if (!this.globalSearchQueryText.trim()) {
      this.filteredReservations = [...this.masterReservations];
      return;
    }
    this.filteredReservations = this.masterReservations.filter(x => 
      x.customerName.toLowerCase().includes(this.globalSearchQueryText.toLowerCase()) ||
      x.tableNo.toLowerCase().includes(this.globalSearchQueryText.toLowerCase())
    );
  }

  deleteReservationRecordItem(sl: number): void {
    this.masterReservations = this.masterReservations.filter(x => x.sl !== sl);
    this.filterReservationsGlobalTable();
  }

  initializeReservationEditPayload(res: DiningTableReservation): void {
    this.newReservationFormState = { fromDate: res.date, toDate: res.date, guestName: res.customerName, phone: '9000000000', menu: 'Demo 1', advancedAmount: 0, totalAmount: 500 };
    this.toggleReservationFormDialog(true);
  }

  toggleUnavailabilityModalState(open: boolean): void {
    this.isUnavailabilityModalOpen = open;
  }

  commitUnavailabilityOverrideState(): void {
    this.unavailabilityList.push({
      sl: this.unavailabilityList.length + 1,
      unavailableDate: this.newUnavailabilityFormState.date,
      startTime: this.newUnavailabilityFormState.startTime || '00:00',
      endTime: this.newUnavailabilityFormState.endTime || '23:59',
      status: this.newUnavailabilityFormState.status
    });
    this.toggleUnavailabilityModalState(false);
  }

  removeUnavailabilityRecord(sl: number): void {
    this.unavailabilityList = this.unavailabilityList.filter(x => x.sl !== sl);
  }

  saveSettingsToSystemStorage(): void {
    console.log('Persisting reservation criteria system adjustments parameters:', this.reservationSettings);
    alert('System operational configuration metadata parameters loaded successfully.');
  }

  resetSettingsToSystemDefaults(): void {
    this.reservationSettings = { availableOn: '09:00:00', closingTime: '22:00:00', maxReservePerson: 20 };
  }

  triggerDataExport(formatType: string): void {
    console.log(`Executing export protocol driver tracking module for output format: [${formatType.toUpperCase()}]`);
    alert(`File asset stream conversion downloaded successfully as ${formatType.toUpperCase()}.`);
  }
}