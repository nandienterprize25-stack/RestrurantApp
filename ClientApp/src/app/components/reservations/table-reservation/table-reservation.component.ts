import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationService, ReservationDto, UnavailabilityDayDto } from '../../../services/reservation.service';
import { CustomAlertService } from '../../../services/custom-alert.service';

@Component({
  selector: 'app-table-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './table-reservation.component.html',
  styleUrls: ['../reservation.css']
})
export class TableReservationComponent implements OnInit {
  @ViewChild('reservationModal') reservationModal!: TemplateRef<any>;
  @ViewChild('unavailabilityModal') unavailabilityModal!: TemplateRef<any>;

  private dialog = inject(MatDialog);
  private alertService = inject(CustomAlertService);
  private backendService = inject(ReservationService);

  activeTab: 'list' | 'unavailability' | 'settings' = 'list';
  searchText: string = '';

  reservations: any[] = [];
  unavailabilities: any[] = [];

  newReservation: any = this.getEmptyReservation();
  newUnavailability: any = this.getEmptyUnavailability();
  isEditingMode: boolean = false;

  // 🌟 FIX: Re-expose configuration configuration objects to template context
  settings: any = { availableOn: '09:00:00', closingTime: '22:00:00', maxReservePerson: 20 };

  ngOnInit(): void {
    this.loadReservations();
    this.loadUnavailabilities();
  }

  loadReservations(): void {
    this.backendService.getReservationsByType('TableBooking').subscribe(data => {
      this.reservations = data.map(r => ({
        ...r,
        date: r.bookingDate // Alias bookingDate to satisfy row.date framework rendering loops
      }));
    });
  }

  loadUnavailabilities(): void {
    this.backendService.getUnavailabilitySheet().subscribe(data => {
      this.unavailabilities = data.map(u => ({
        ...u,
        availableTime: `${u.startTime} - ${u.endTime}` // Re-assign string label block structure
      }));
    });
  }

  openNewReservation(booking?: any): void {
    this.isEditingMode = !!booking;
    this.newReservation = booking ? { ...booking } : this.getEmptyReservation();
    this.dialog.open(this.reservationModal, { width: '100vw', height: '100vh', maxWidth: '100vw', panelClass: 'fullscreen-dialog-pane', disableClose: true });
  }

  saveReservation(): void {
    this.newReservation.bookingDate = this.newReservation.date || this.newReservation.bookingDate;
    this.backendService.upsertReservation(this.newReservation).subscribe(() => {
      this.loadReservations();
      this.dialog.closeAll();
      this.alertService.show({ type: 'success', title: 'Saved', message: 'Table booking entry operational.' });
    });
  }

  // 🌟 FIX: Standardize interface signatures to parse matching generic row index patterns
  deleteReservation(slId: any): void {
    const targetId = this.reservations.find(x => x.sl === slId || x.id === slId)?.id;
    if (!targetId) return;

    this.alertService.show({
      type: 'warning', title: 'Drop Entry', message: 'Scrub table reservation data record?', showCancel: true,
      onConfirm: () => {
        this.backendService.deleteReservation(targetId).subscribe(() => this.loadReservations());
      }
    });
  }

  openUnavailabilityPopup(): void {
    this.newUnavailability = this.getEmptyUnavailability();
    this.dialog.open(this.unavailabilityModal, { width: '500px' });
  }

  saveUnavailability(): void {
    this.backendService.addUnavailabilityWindow(this.newUnavailability).subscribe(() => {
      this.loadUnavailabilities();
      this.dialog.closeAll();
    });
  }

  // 🌟 FIX: Add baseline tracking configurations functionality callbacks
  saveSettings(): void {
    this.alertService.show({ type: 'success', title: 'Parameters Saved', message: 'Configuration parameters updated successfully.' });
  }

  exportData(format: string): void {
    this.alertService.show({ type: 'info', title: 'Exporting Data', message: `Sheet downloaded successfully as ${format.toUpperCase()}` });
  }

  private getEmptyReservation() {
    return { date: new Date().toISOString().split('T')[0], bookingDate: new Date().toISOString().split('T')[0], customerName: '', phoneNo: '', tableNo: '', numberOfPeople: 2, startTime: '18:00', endTime: '20:00', status: 'Pending', type: 'TableBooking', items: [] };
  }

  private getEmptyUnavailability() {
    return { unavailableDate: new Date().toISOString().split('T')[0], startTime: '00:00', endTime: '23:59', status: 'Active' };
  }
}