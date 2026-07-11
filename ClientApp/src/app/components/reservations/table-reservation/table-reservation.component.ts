import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TableReservationItem, UnavailabilityItem } from '../../../models/reservation.model';
import { ActivatedRoute } from '@angular/router'; // 👈 Import ActivatedRoute
// ... keep previous imports


// @Component({
//   selector: 'app-table-reservation',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatDialogModule],
//   templateUrl: './table-reservation.component.html',
//   styleUrls: ['./table-reservation.component.css']
// })
@Component({
  selector: 'app-table-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './table-reservation.component.html',
  styleUrls: ['../reservation.css'] // 👈 FIX: Directing compilation pointer away from local missing .css file
})
export class TableReservationComponent implements OnInit {
  @ViewChild('reservationModal') reservationModal!: TemplateRef<any>;
  @ViewChild('unavailabilityModal') unavailabilityModal!: TemplateRef<any>;

  activeTab: 'list' | 'unavailability' | 'settings' = 'list';
  searchText: string = '';

  // Core Data Frames
  reservations: TableReservationItem[] = [];
  unavailabilities: UnavailabilityItem[] = [];

  // Active Models Configuration Data Payloads
  newReservation: any = this.getEmptyReservation();
  newUnavailability: any = this.getEmptyUnavailability();

  // Settings Fields Form Objects
  settings: any = { availableOn: '09:00:00', closingTime: '22:00:00', maxReservePerson: 20 };

  constructor(private dialog: MatDialog, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Read current sub-route to automatically switch tabs when clicked from sidebar
    const currentUrl = window.location.pathname;
    if (currentUrl.includes('unavailable-day')) {
      this.activeTab = 'unavailability';
    } else if (currentUrl.includes('setting')) {
      this.activeTab = 'settings';
    } else if (currentUrl.includes('add-booking')) {
      this.activeTab = 'list';
      setTimeout(() => this.openNewReservation(), 300); // Automatically trigger form popup
    } else {
      this.activeTab = 'list';
    }

    this.loadMockReservations();
    this.loadMockUnavailabilities();
  }

  loadMockReservations(): void {
    this.reservations = [
      { 
        id: 1, // 👈 Added required property
        sl: 1, 
        customerName: 'Sarah Jenkins', 
        tableNo: 'T-04', 
        numberOfPeople: 4, 
        startTime: '19:00', 
        endTime: '21:00', 
        date: '2026-07-12', 
        status: 'Confirmed' 
      }
    ];
  }

  saveReservation(): void {
    const nextIdentifier = this.reservations.length + 1;
    this.reservations.push({
      id: nextIdentifier, // 👈 Added required property
      sl: nextIdentifier,
      customerName: this.newReservation.guestName,
      tableNo: 'Assigned-Auto',
      numberOfPeople: 2,
      startTime: '18:00',
      endTime: '20:00',
      date: this.newReservation.fromDate,
      status: 'Pending'
    });
    this.dialog.closeAll();
  }

  loadMockUnavailabilities(): void {
    this.unavailabilities = [
      { sl: 1, unavailableDate: '2026-07-15', availableTime: '09:00 AM - 05:00 PM' }
    ];
  }

  openNewReservation(): void {
    this.newReservation = this.getEmptyReservation();
    this.dialog.open(this.reservationModal, { width: '600px' });
  }

  openUnavailabilityPopup(): void {
    this.newUnavailability = this.getEmptyUnavailability();
    this.dialog.open(this.unavailabilityModal, { width: '500px' });
  }

  // saveReservation(): void {
  //   const nextIdentifier = this.reservations.length + 1;
  //   this.reservations.push({
  //     id: nextIdentifier,
  //     sl: nextIdentifier,
  //     customerName: this.newReservation.guestName,
  //     tableNo: 'Assigned-Auto',
  //     numberOfPeople: 2,
  //     startTime: '18:00',
  //     endTime: '20:00',
  //     date: this.newReservation.fromDate,
  //     status: 'Pending'
  //   });
  //   this.dialog.closeAll();
  // }

  saveUnavailability(): void {
    this.unavailabilities.push({
      sl: this.unavailabilities.length + 1,
      unavailableDate: this.newUnavailability.date,
      availableTime: `${this.newUnavailability.start} - ${this.newUnavailability.end}`
    });
    this.dialog.closeAll();
  }

  saveSettings(): void {
    console.log('System reservation window settings locked: ', this.settings);
    alert('Settings saved successfully.');
  }

  exportData(type: string): void {
    alert(`Data payload stream compiled to format layout: ${type.toUpperCase()}`);
  }

  private getEmptyReservation() {
    return { fromDate: '', toDate: '', guestName: '', phone: '', menu: '', advancedAmount: 0, totalAmount: 0 };
  }

  private getEmptyUnavailability() {
    return { date: '', start: '', end: '', status: 'Active' };
  }
}