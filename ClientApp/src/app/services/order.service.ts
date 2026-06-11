import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5247/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  downloadPdf(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/pdf`, { responseType: 'blob' });
  }

  downloadExcel(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/excel`, { responseType: 'blob' });
  }

  downloadCsv(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/csv`, { responseType: 'blob' });
  }
}
