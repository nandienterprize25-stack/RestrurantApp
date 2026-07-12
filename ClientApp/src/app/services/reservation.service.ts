import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Adjust path if needed

export interface ReservationItemDto {
  sl: number;
  date: string;
  roomNo?: string;
  category?: string;
  menuName: string;
  qty: number;
  total: number;
}

export interface ReservationDto {
  id?: string;
  sl: number;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  phoneNo?: string;
  guestName?: string;
  guestPhone?: string;
  tableNo?: string;
  numberOfPeople: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  category?: string;
  status: string;
  type: 'TableBooking' | 'FoodBooking' | 'TakeOrder';
  advancedAmount: number;
  totalAmount: number;
  paymentMode?: string;
  paymentDate?: string;
  items: ReservationItemDto[];
}

export interface UnavailabilityDayDto {
  id?: string;
  sl: number;
  unavailableDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
 // Change line 54 inside reservation.service.ts to use .baseUrl:
private apiUrl = `${environment.baseUrl}/api/reservation`;
  // Fetch reservations matching type discriminator keys
  getReservationsByType(type: 'TableBooking' | 'FoodBooking' | 'TakeOrder'): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/type/${type}`);
  }

  // Create or Update records
  upsertReservation(dto: ReservationDto): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(this.apiUrl, dto);
  }

  // Drop record index from ledger tracking
  deleteReservation(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Get all active blackout windows
  getUnavailabilitySheet(): Observable<UnavailabilityDayDto[]> {
    return this.http.get<UnavailabilityDayDto[]>(`${this.apiUrl}/unavailability`);
  }

  // Commit a new operational calendar blackout window
  addUnavailabilityWindow(dto: UnavailabilityDayDto): Observable<UnavailabilityDayDto> {
    return this.http.post<UnavailabilityDayDto>(`${this.apiUrl}/unavailability`, dto);
  }

 // Inside your ReservationService class in reservation.service.ts

getCategories(): Observable<any[]> {
  // 🌟 FIX: Removed "/api" from the string path template literal
  return this.http.get<any[]>(`${environment.baseUrl}/categories`);
}

getMenuItems(categoryId?: string): Observable<any[]> {
  let params = new HttpParams();
  if (categoryId) {
    params = params.set('categoryId', categoryId);
  }
  // 🌟 FIX: Removed "/api" from the string path template literal
  return this.http.get<any[]>(`${environment.baseUrl}/menuitems`, { params });
}
}