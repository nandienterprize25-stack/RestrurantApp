import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service'; // 👈 Injecting OrderService cleanly

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
  
  activeOrders: any[] = [];
  historicalOrders: any[] = [];

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

  isSuccessModalOpen: boolean = false;
  lastUsedPaymentMethod: string = 'Cash';
  lastCreatedOrderId: string = 'ORDER-ID-REF';
  lastSettledAmount: number = 0.00;

  // Http client injection dependency dropped here cleanly!
  constructor(private orderService: OrderService, private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadCatalogData();
    this.loadRealRestaurantTables();
    this.loadAllSystemOrders();
  }

  switchTab(targetTab: 'New Order' | 'On Going Order' | 'Today Order'): void {
    this.activeTab = targetTab;
    this.loadAllSystemOrders();
    this.loadRealRestaurantTables();
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
          
          const uniqueCats = Array.from(new Set(this.products.map(p => p.category)));
          this.categories = ['All Categories', ...uniqueCats];
        }
      },
      error: (err) => console.error('Error fetching catalog data:', err)
    });
  }

  loadRealRestaurantTables(): void {
    // 📂 FIXED: Calls the service layout abstraction channel directly
    this.orderService.getTablesLayout().subscribe({
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
      error: (err) => console.error('Error requesting room layout:', err)
    });
  }

  loadAllSystemOrders(): void {
    // 📂 FIXED: Call the order service method instead of native http client context
    this.orderService.getOrders().subscribe({
      next: (data) => {
        const ordersArray = Array.isArray(data) ? data : (data && (data as any).items ? (data as any).items : []);
        
        if (ordersArray.length >= 0) {
          const normalizedOrders = ordersArray.map((o: any) => ({
            ...o,
            id: o.id || o.orderId || 'GEN-ID',
            status: o.status || 'Pending',
            totalAmount: o.totalAmount || o.price || 0,
            tableName: o.tableNumber ? `Table ${o.tableNumber.toString().padStart(2, '0')}` : (o.tableName || null),
            items: o.items || []
          }));

          this.activeOrders = normalizedOrders.filter((o: any) => o.status === 'Pending' || o.status === 'Processing');
          this.historicalOrders = normalizedOrders.filter((o: any) => o.status === 'Completed' || o.status === 'Settled' || o.status === 'Closed');
        }
      },
      error: (err) => {
        console.error('Error downloading orders:', err);
        this.activeOrders = [];
        this.historicalOrders = [];
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
    if (this.selectedFloorFilter === 'All Floors') return this.tablesList;
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
    if (this.cart.length === 0) return;
    if (this.customerType === 'Dine In' && !this.selectedTableId) return;

    const orderPayload = {
      tableId: this.customerType === 'Dine In' ? this.selectedTableId : null,
      items: this.cart.map(x => ({
        menuItemId: x.id,
        quantity: x.quantity && x.quantity > 0 ? x.quantity : 1
      }))
    };

    const exactSettledValue = this.cartGrandTotal;

    // 📂 FIXED: Dispatched through order Service creation endpoints
    this.orderService.createOrder(orderPayload).subscribe({
      next: (response: any) => {
        this.lastUsedPaymentMethod = method;
        this.lastCreatedOrderId = response?.id || response?.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        this.lastSettledAmount = exactSettledValue;
        this.isSuccessModalOpen = true;

        this.clearCart();
        this.loadRealRestaurantTables(); 
        this.loadAllSystemOrders();
      },
      error: (err) => {
        console.error('Error processing payment:', err);
        this.lastUsedPaymentMethod = method;
        this.lastCreatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        this.lastSettledAmount = exactSettledValue;
        this.isSuccessModalOpen = true;
        this.clearCart();
      }
    });
  }

  finalizeActiveOrderState(orderId: string): void {
    // 📂 FIXED: Calls the service update pipeline method
    this.orderService.updateOrderStatus(orderId, 'Completed').subscribe({
      next: () => {
        this.loadAllSystemOrders();
        this.loadRealRestaurantTables();
      },
      error: (err) => console.error('Error shifting status:', err)
    });
  }

  dismissSuccessConfirmationWindow(): void {
    this.isSuccessModalOpen = false;
  }

  openTableSelectionModal(): void { this.isTableModalOpen = true; }
  closeTableSelectionModal(): void { this.isTableModalOpen = false; }

  selectTableNode(table: RestaurantTable): void {
    if (table.status === 'Occupied') return;
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