import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest } from '../models'; 
import { environment } from '../../environments/environment'; // Make sure this path matches your project structure

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Use the central environment configuration baseUrl dynamically
  private apiUrl = `${environment.baseUrl}/orders`;

  constructor(private http: HttpClient) {}

 getOrders(): Observable<any[]> {
  const token = localStorage.getItem('token');
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any[]>(this.apiUrl, { headers });
}

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order);
  }

  // 📂 Moved: Get Restaurant Tables Layout API Call
  getTablesLayout(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tables-layout`);
  }

  // 📂 Moved: Update Active Order Status API Call
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { status });
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

  /**
   * Fetches matching application order lists parsed matching layout query controls.
   */
  getFilteredOrders(filters: {
    fromDate?: string;
    toDate?: string;
    invoiceNo?: string;
    waiter?: string;
    tableOrRoom?: string;
    orderStatus?: string;
    paymentMode?: string;
    paymentStatus?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.invoiceNo) params = params.set('invoiceNo', filters.invoiceNo);
    if (filters.waiter) params = params.set('waiter', filters.waiter);
    if (filters.tableOrRoom) params = params.set('tableOrRoom', filters.tableOrRoom);
    if (filters.orderStatus) params = params.set('orderStatus', filters.orderStatus);
    if (filters.paymentMode) params = params.set('paymentMode', filters.paymentMode);
    if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);

    return this.http.get<any[]>(`${this.apiUrl}/filtered`, { params });
  }

  /**
   * Triggers file download streams cleanly using the built-in system endpoints.
   */
  exportOrdersToExcel(filters: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/excel`, filters, { responseType: 'blob' });
  }
}