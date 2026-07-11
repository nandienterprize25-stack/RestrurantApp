import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookedMenuItem, UnavailabilityItem } from '../../../models/reservation.model';

@Component({
  selector: 'app-unavailable-day',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unavailable-day.component.html',
  styleUrls: ['../reservation.css']
})
export class UnavailableDayComponent implements OnInit {
  unavailabilities: UnavailabilityItem[] = [];
  newLock: any = { date: '', start: '', end: '' };

  ngOnInit(): void {
    this.unavailabilities = [
      { sl: 1, unavailableDate: '2026-07-15', availableTime: '09:00 AM - 05:00 PM' }
    ];
  }

  saveUnavailability(): void {
    if (this.newLock.date && this.newLock.start && this.newLock.end) {
      this.unavailabilities.push({
        sl: this.unavailabilities.length + 1,
        unavailableDate: this.newLock.date,
        availableTime: `${this.newLock.start} - ${this.newLock.end}`
      });
      this.newLock = { date: '', start: '', end: '' };
    }
  }
}