import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface PosProduct {
  id: string; 
  name: string;
  price: number;
  category: string;
  stock: number;
  imageCode: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageCode: string;
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
  activeTab: 'New Order' | 'On Going Order' | 'Today Order' = 'New Order';
  
  categories: string[] = ['All Categories'];
  selectedCategory: string = 'All Categories';
  products: PosProduct[] = [];
  tablesList: RestaurantTable[] = [];
  
  customerName: string = 'Walk-In Customer';
  customerType: string = 'Dine In';
  waiterName: string = 'Staff Alpha';
  selectedTable: string = 'Tap to Choose';
  selectedTableId: string | null = null;
  searchQuery: string = '';

  cart: CartItem[] = [];
  discountPercentage: number = 0;
  vatRatePercentage: number = 5;

  isTableModalOpen: boolean = false;
  selectedFloorFilter: string = 'All Floors';

  private baseUrl = 'http://localhost:5247/api';

  constructor(private http: HttpClient, private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadCatalogData();
    this.loadRealRestaurantTables();
  }

  // Unified Request Header Interceptor Factory
  private getAuthOptions() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  loadCatalogData(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res: any) => {
        if (res && res.items) {
          this.products = res.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.categoryName || 'Main Course',
            stock: 99,
            imageCode: this.getRandomEmoji(item.name)
          }));
          
          if (res.categories && Array.isArray(res.categories)) {
            const fetchedCats = res.categories.map((c: any) => c.name || c.categoryName);
            this.categories = ['All Categories', ...fetchedCats];
          } else {
            const uniqueCats = Array.from(new Set(this.products.map(p => p.category)));
            this.categories = ['All Categories', ...uniqueCats];
          }
        }
      },
      error: (err) => console.error('Error fetching structural menu elements from API', err)
    });
  }

  loadRealRestaurantTables(): void {
    this.http.get<any[]>(`${this.baseUrl}/orders/tables-layout`, this.getAuthOptions()).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.tablesList = data.map((t: any) => {
            const fallbackName = `Table ${t.number?.toString().padStart(2, '0') || '01'}`;
            return {
              id: t.id,
              name: t.displayName || t.name || fallbackName,
              capacity: t.capacity || 4,
              status: (t.status || 'Available') as 'Available' | 'Occupied' | 'Reserved',
              floor: t.number <= 4 ? 'Floor 1' : t.number <= 8 ? 'Floor 2' : 'VIP Room'
            };
          });
        }
      },
      error: (err) => {
        console.error('Error requesting current room matrices data elements', err);
        if (err.status === 401) {
          alert('⚠️ Session expired or unauthorized! Please log into the system again to retrieve table structures.');
        }
      }
    });
  }

  get filteredProducts(): PosProduct[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'All Categories' || p.category === this.selectedCategory;
      const matchQuery = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }

  get filteredTables(): RestaurantTable[] {
    if (this.selectedFloorFilter === 'All Floors') {
      return this.tablesList;
    }
    return this.tablesList.filter(t => t.floor === this.selectedFloorFilter);
  }

  addToCart(prod: PosProduct): void {
    const matchedRow = this.cart.find(x => x.id === prod.id);
    if (matchedRow) {
      this.incrementQuantity(matchedRow);
    } else {
      const newItem: CartItem = {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        category: prod.category,
        stock: prod.stock,
        imageCode: prod.imageCode,
        quantity: 1,
        vatAmount: prod.price * (this.vatRatePercentage / 100),
        total: prod.price
      };
      this.cart.push(newItem);
    }
  }

  incrementQuantity(item: CartItem): void {
    if (item.quantity < item.stock) {
      item.quantity++;
      this.recalculateItemRow(item);
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.recalculateItemRow(item);
    } else {
      this.removeFromCart(item);
    }
  }

  private recalculateItemRow(item: CartItem): void {
    item.vatAmount = (item.price * item.quantity) * (this.vatRatePercentage / 100);
    item.total = item.price * item.quantity;
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(c => c.id !== item.id);
  }

  clearCart(): void {
    this.cart = [];
    this.selectedTableId = null;
    this.selectedTable = 'Tap to Choose';
  }

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
  if (this.cart.length === 0) {
    alert('Your operational checkout ledger is empty!');
    return;
  }

  if (this.customerType === 'Dine In' && !this.selectedTableId) {
    alert('Please select an operational table map assignment configuration before placing a Dine-In checkout transaction.');
    return;
  }

  // 👇 THE SHIELD: Map items while forcing quantity to always be at least 1
  const orderPayload = {
    tableId: this.customerType === 'Dine In' ? this.selectedTableId : null,
    items: this.cart.map(x => {
      // If quantity fell to 0 or is somehow null/undefined, force it to 1
      const validatedQuantity = (x.quantity && x.quantity > 0) ? x.quantity : 1;
      
      return {
        menuItemId: x.id,
        quantity: validatedQuantity
      };
    })
  };

  console.log('Sending Validated Payload:', orderPayload);

  this.http.post(`${this.baseUrl}/orders`, orderPayload).subscribe({
    next: (response: any) => {
      alert(`🎉 Transaction Cleared via [${method}]! Record persisted into system database safely.`);
      this.clearCart();
      this.loadRealRestaurantTables(); 
    },
    error: (err) => {
      console.error('Backend Checkout Rejection Details:', err);
      alert('Failed saving live transaction state onto server backend context. Check console for details.');
    }
  });
}

  openTableSelectionModal(): void {
    this.isTableModalOpen = true;
  }

  closeTableSelectionModal(): void {
    this.isTableModalOpen = false;
  }

  selectTableNode(table: RestaurantTable): void {
    if (table.status === 'Occupied') {
      alert('This layout map placement node is currently flagged as occupied by another active process order state.');
      return;
    }
    this.selectedTableId = table.id;
    this.selectedTable = table.name;
    this.closeTableSelectionModal();
  }

  private getRandomEmoji(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes('burger')) return '🍔';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('coffee') || name.includes('tea')) return '☕';
    if (name.includes('juice') || name.includes('drink')) return '🍹';
    if (name.includes('cake') || name.includes('dessert')) return '🍰';
    return '🍽️';
  }
}