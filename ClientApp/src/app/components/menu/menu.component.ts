import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, Category } from '../../models';
import { MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-container">
      <header class="header">
        <h1>Restaurant Menu</h1>
        <div class="user-section">
          <span class="username">{{ currentUser?.fullName }}</span>
          <button class="btn-orders" (click)="goToOrders()">My Orders</button>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="content">
        <div class="categories">
          <button 
            *ngFor="let cat of categories"
            [class.active]="selectedCategory?.id === cat.id"
            (click)="selectCategory(cat)"
            class="category-btn">
            {{ cat.name }}
          </button>
        </div>

        <div class="menu-items">
          <div *ngFor="let item of filteredItems" class="menu-item">
            <h3>{{ item.name }}</h3>
            <p class="description">{{ item.description }}</p>
            <div class="footer">
              <span class="price">\${{ item.price.toFixed(2) }}</span>
              <button class="btn-add" (click)="addToOrder(item)">Add to Order</button>
            </div>
          </div>
        </div>
      </div>

      <div class="order-summary">
        <h2>Current Order</h2>
        <div *ngIf="orderItems.length === 0" class="empty">
          No items selected
        </div>
        <div *ngIf="orderItems.length > 0" class="items">
          <div *ngFor="let item of orderItems" class="order-item">
            <span>{{ item.name }} x {{ item.quantity }}</span>
            <span>\${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="total">
            <strong>Total: \${{ getOrderTotal().toFixed(2) }}</strong>
          </div>
          <button class="btn-checkout" (click)="checkout()">Checkout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .username {
      font-size: 14px;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
    }

    .content {
      display: flex;
      flex: 1;
      gap: 20px;
      padding: 20px;
    }

    .categories {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 150px;
    }

    .category-btn {
      padding: 10px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .category-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .menu-items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      flex: 1;
    }

    .menu-item {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }

    .menu-item:hover {
      transform: translateY(-5px);
    }

    .menu-item h3 {
      margin: 0 0 10px;
      font-size: 16px;
    }

    .description {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-weight: bold;
      font-size: 18px;
      color: #667eea;
    }

    .btn-add {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
    }

    .order-summary {
      background: white;
      padding: 20px;
      border-top: 1px solid #ddd;
      min-height: 200px;
    }

    .empty {
      color: #999;
      text-align: center;
      padding: 20px;
    }

    .items {
      max-height: 150px;
      overflow-y: auto;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .total {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #667eea;
      text-align: right;
      font-size: 18px;
    }

    .btn-checkout {
      width: 100%;
      margin-top: 10px;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
  `]
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  orderItems: any[] = [];
  currentUser: any;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMenu();
  }

  loadMenu() {
  this.menuService.getMenuItems().subscribe({
    next: (data: any) => {
      // Safely fallback to an empty array if data or properties are null/undefined
      this.menuItems = data?.items || [];
      this.categories = data?.categories || [];
      
      // ✅ Added safety check here using optional chaining
      if (this.categories?.length > 0) {
        this.selectCategory(this.categories[0]);
      }
    },
    error: (err) => console.error('Error loading menu', err)
  });
}

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  get filteredItems(): MenuItem[] {
    if (!this.selectedCategory) return [];
    return this.menuItems.filter(item => item.category === this.selectedCategory?.name);
  }

  addToOrder(item: MenuItem) {
    const existing = this.orderItems.find(oi => oi.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.orderItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        menuItemId: item.id
      });
    }
  }

  getOrderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  checkout() {
    if (this.orderItems.length === 0) return;
    // Navigate to checkout page
    this.router.navigate(['/checkout'], { state: { items: this.orderItems } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
