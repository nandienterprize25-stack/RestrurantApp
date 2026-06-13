import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, MenuItem } from '../models/food-management.models';

@Injectable({
  providedIn: 'root'
})
export class FoodManagementService {
  private categoryUrl = `${environment.baseUrl}/categories`;
  private menuItemUrl = `${environment.baseUrl}/menuitems`;

  constructor(private http: HttpClient) {}

  // Inside your FoodManagementService methods:
private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token'); // or wherever your AuthService saves the JWT string
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
}
  // ==========================================
  // 📂 CATEGORIES ENDPOINTS
  // ==========================================
  getCategories(includeInactive: boolean = false): Observable<Category[]> {
  const params = new HttpParams().set('includeInactive', includeInactive.toString());
  return this.http.get<Category[]>(this.categoryUrl, { params, headers: this.getAuthHeaders() });
}

createCategory(category: Partial<Category>): Observable<Category> {
  return this.http.post<Category>(this.categoryUrl, category, { headers: this.getAuthHeaders() });
}
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.categoryUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
  
  updateCategory(id: string, category: Partial<Category>): Observable<void> {
    return this.http.put<void>(`${this.categoryUrl}/${id}`, category, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // ==========================================
  // 🍔 MENU ITEMS ENDPOINTS
  // ==========================================
  getMenuItems(includeInactive: boolean = false, categoryId?: string): Observable<MenuItem[]> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this.http.get<MenuItem[]>(this.menuItemUrl, { params, headers: this.getAuthHeaders() });
  }

  getMenuItemById(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.menuItemUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createMenuItem(menuItem: any): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.menuItemUrl, menuItem, { headers: this.getAuthHeaders() });
  }

  updateMenuItem(id: string, menuItem: any): Observable<void> {
    return this.http.put<void>(`${this.menuItemUrl}/${id}`, menuItem, { headers: this.getAuthHeaders() });
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.menuItemUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}