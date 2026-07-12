import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-unavailable-day',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unavailable-day.component.html',
  styleUrls: ['../reservation.css']
})
export class UnavailableDayComponent implements OnInit {
  private backendService = inject(ReservationService);

  // 🌟 Typings altered to any[] to allow mapping dynamic view properties
  unavailabilities: any[] = [];
  newLock: any = { date: '', start: '00:00', end: '23:59' };

  ngOnInit(): void {
    this.refreshSheet();
  }

  refreshSheet(): void {
    this.backendService.getUnavailabilitySheet().subscribe(data => {
      // 🌟 Map incoming array data to assign the missing template layout property
      this.unavailabilities = data.map(u => ({
        ...u,
        availableTime: `${u.startTime} - ${u.endTime}`
      }));
    });
  }

  saveUnavailability(): void {
    if (this.newLock.date && this.newLock.start && this.newLock.end) {
      const payload = {
        sl: 0,
        unavailableDate: this.newLock.date,
        startTime: this.newLock.start,
        endTime: this.newLock.end,
        status: 'Active'
      };

      this.backendService.addUnavailabilityWindow(payload).subscribe(() => {
        this.refreshSheet();
        this.newLock = { date: '', start: '00:00', end: '23:59' };
      });
    }
  }
}