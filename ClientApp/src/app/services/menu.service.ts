import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem, Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:5000/api/menuitems';

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addMenuItem(menuItem: any): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, menuItem);
  }
}
