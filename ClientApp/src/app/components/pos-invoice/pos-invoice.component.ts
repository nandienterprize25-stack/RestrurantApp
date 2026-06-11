import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PosProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageCode: string;
}

interface CartItem extends PosProduct {
  quantity: number;
  vatAmount: number;
  total: number;
}

interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  floor: string;
}

@Component({
  selector: 'app-pos-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-invoice.component.html',
  styleUrls: ['./pos-invoice.component.css']
})
export class PosInvoiceComponent implements OnInit {
  // Operational Screen Navigation Mode Switchers
  activeTab: 'New Order' | 'On Going Order' | 'Today Order' = 'New Order';
  
  // Data Repositories
  categories: string[] = ['All Categories', 'Main Course', 'Starters', 'Beverages', 'Desserts', 'Fast Food'];
  selectedCategory: string = 'All Categories';
  searchQuery: string = '';

  // Core POS Customer Form Values
  customerName: string = 'Walk-In Customer';
  customerType: string = 'Dine In';
  waiterName: string = 'John Doe';
  selectedTable: string = 'Table 05 (Floor 1)';

  // Modal Control Flags
  isTableModalOpen: boolean = false;
  selectedFloorFilter: string = 'All Floors';

  // Component State Tracking Lists
  products: PosProduct[] = [];
  cart: CartItem[] = [];
  tables: RestaurantTable[] = [];

  // Policy Settings
  vatRatePercentage: number = 5;
  discountPercentage: number = 0;

  ngOnInit(): void {
    // Mock Product Data Repo setup
    this.products = [
      { id: 101, name: 'Truffle Mushroom Burger', price: 12.50, category: 'Fast Food', stock: 15, imageCode: '🍔' },
      { id: 102, name: 'Spicy Salmon Sushi Roll', price: 18.00, category: 'Starters', stock: 8, imageCode: '🍣' },
      { id: 103, name: 'Wood-Fired Margherita Pizza', price: 14.99, category: 'Main Course', stock: 20, imageCode: '🍕' },
      { id: 104, name: 'Classic Caesar Salad', price: 9.50, category: 'Starters', stock: 25, imageCode: '🥗' },
      { id: 105, name: 'Artisanal Chocolate Lava Cake', price: 7.25, category: 'Desserts', stock: 12, imageCode: '🍰' },
      { id: 106, name: 'Iced Caramel Macchiato', price: 4.50, category: 'Beverages', stock: 40, imageCode: '☕' }
    ];

    // Populating Interactive Table selection grid array matching your reference images
    this.tables = [
      { id: 'T1', name: 'Table 01', capacity: 2, status: 'Available', floor: 'Floor 1' },
      { id: 'T2', name: 'Table 02', capacity: 4, status: 'Occupied', floor: 'Floor 1' },
      { id: 'T3', name: 'Table 03', capacity: 4, status: 'Available', floor: 'Floor 1' },
      { id: 'T4', name: 'Table 04', capacity: 6, status: 'Reserved', floor: 'Floor 1' },
      { id: 'T5', name: 'Table 05', capacity: 2, status: 'Available', floor: 'Floor 1' },
      { id: 'T6', name: 'Table 06', capacity: 8, status: 'Occupied', floor: 'Floor 2' },
      { id: 'T7', name: 'Table 07', capacity: 4, status: 'Available', floor: 'Floor 2' },
      { id: 'T8', name: 'Table 08', capacity: 4, status: 'Available', floor: 'Floor 2' },
      { id: 'T9', name: 'Table 09', capacity: 2, status: 'Reserved', floor: 'VIP Room' },
      { id: 'T10', name: 'Table 10', capacity: 6, status: 'Available', floor: 'VIP Room' }
    ];
  }

  // Table Modal Window Filter Rules
  get filteredTables(): RestaurantTable[] {
    if (this.selectedFloorFilter === 'All Floors') return this.tables;
    return this.tables.filter(t => t.floor === this.selectedFloorFilter);
  }

  openTableSelectionModal(): void {
    this.isTableModalOpen = true;
  }

  closeTableSelectionModal(): void {
    this.isTableModalOpen = false;
  }

  selectTableNode(table: RestaurantTable): void {
    if (table.status === 'Occupied') {
      alert(`${table.name} is currently occupied with an active order check.`);
      return;
    }
    this.selectedTable = `${table.name} (${table.floor})`;
    this.closeTableSelectionModal();
  }

  // Base Cart Actions
  get filteredProducts(): PosProduct[] {
    return this.products.filter(p => {
      const matchCategory = this.selectedCategory === 'All Categories' || p.category === this.selectedCategory;
      return matchCategory && p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  addToCart(product: PosProduct): void {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        existing.quantity++;
      }
    } else {
      this.cart.push({ ...product, quantity: 1, vatAmount: 0, total: 0 });
    }
  }

  incrementQuantity(item: CartItem): void {
    if (item.quantity < item.stock) item.quantity++;
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(c => c.id !== item.id);
  }

  clearCart(): void {
    this.cart = [];
  }

  // Mathematical Aggregators
  get cartSubTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get cartVatTotal(): number {
    return this.cartSubTotal * (this.vatRatePercentage / 100);
  }

  get cartGrandTotal(): number {
    const discountValue = this.cartSubTotal * (this.discountPercentage / 100);
    return (this.cartSubTotal + this.cartVatTotal) - discountValue;
  }

  processPayment(method: string): void {
    if (this.cart.length === 0) return;
    alert(`Receipt Finalized via [${method}] targeting ${this.selectedTable}. Total: $${this.cartGrandTotal.toFixed(2)}`);
    this.clearCart();
  }
}