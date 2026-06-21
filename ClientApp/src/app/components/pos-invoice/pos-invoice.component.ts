import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { FoodManagementService } from '../../services/food-management.service';
import { Router } from '@angular/router';

interface PosProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  imageCode: string;
  hasVariants: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  floor: string;
}

interface SplitPayment {
  method: 'Cash' | 'Card' | 'UPI';
  amount: number;
}

@Component({
  selector: 'app-pos-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe],
  templateUrl: './pos-invoice.component.html',
  styleUrls: ['./pos-invoice.component.css']
})
export class PosInvoiceComponent implements OnInit {
  activeTab: 'New Order' | 'On Going Order' | 'Today Order' = 'New Order';
  activeLocationTab: 'Restaurant' | 'Room' | 'Cafeteria' = 'Restaurant';

  categories: any[] = [];
  allProducts: PosProduct[] = [];
  filteredProducts: PosProduct[] = [];
  restaurantTables: RestaurantTable[] = [];
  groupedTables: { [floorName: string]: RestaurantTable[] } = {};

  cartItems: CartItem[] = [];
  customerName: string = '';
  waiterName: string = ''; // 👈 Add this line here
  customerType: 'Walk-In' | 'Dine-In' | 'Takeaway' | 'Delivery' = 'Walk-In';
  selectedTable: string = 'Select Table';
  selectedTableId: string | null = null;

  selectedCategory: string = 'ALL';
  searchQuery: string = '';

  isTableDropdownOpen: boolean = false;
  isSuccessModalOpen: boolean = false;
  isSplitPaymentModalOpen: boolean = false;

  taxRate: number = 0.05;
  totalTax: number = 0;
  grandTotal: number = 0;
  lastUsedPaymentMethod: string = '';
  lastCreatedOrderId: string = '';
  lastSettledAmount: number = 0;

  splitPayments: SplitPayment[] = [{ method: 'Cash', amount: 0 }];

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private foodManagementService: FoodManagementService,
    private elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDatabaseCategories();
    this.loadRealProductsFromDb();
    this.loadRealRestaurantTables();
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isTableDropdownOpen = false;
    }
  }

  dismissSuccessConfirmationWindow(): void {
    this.isSuccessModalOpen = false;
    this.router.navigate(['/orders/order-list']);
  }

  toggleTableDropdown(event: Event): void {
    event.stopPropagation();
    this.isTableDropdownOpen = !this.isTableDropdownOpen;
  }

  loadDatabaseCategories(): void {
    this.foodManagementService.getCategories(false).subscribe({
      next: (res: any) => {
        const rawCategories = Array.isArray(res) ? res : (res?.data || []);
        this.categories = [
          { id: 'ALL', name: 'All Menu' },
          ...rawCategories.map((c: any) => ({
            id: c.id || c.Id,
            name: c.name || c.Name || 'Category'
          }))
        ];
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadRealProductsFromDb(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res: any) => {
        const rawItems = Array.isArray(res) ? res : (res?.data || []);
        this.allProducts = rawItems.map((item: any) => {
          const title = item.name || item.Name || '';
          return {
            id: item.id || item.Id,
            name: title,
            price: item.price || item.Price || 0,
            categoryId: item.categoryId || item.CategoryId,
            categoryName: item.category?.name || item.Category?.Name || 'General',
            imageCode: this.getRandomEmoji(title),
            hasVariants: !!(item.variants?.length || item.Variants?.length)
          };
        });
        this.filteredProducts = [...this.allProducts];
      },
      error: (err) => console.error('Error fetching catalog menu items:', err)
    });
  }

  loadRealRestaurantTables(): void {
    this.orderService.getTablesLayout().subscribe({
      next: (res: any) => {
        const rawTables = Array.isArray(res) ? res : (res?.data || []);
        this.restaurantTables = rawTables.map((t: any) => {
          const tName = t.name || t.Name || 'Table';
          let floorVal = t.floor || t.Floor;
          if (!floorVal) {
            if (tName.toLowerCase().includes('f2') || tName.startsWith('2')) floorVal = '2nd Floor';
            else if (tName.toLowerCase().includes('f1') || tName.startsWith('1')) floorVal = '1st Floor';
            else floorVal = 'Ground Floor';
          }
          return {
            id: t.id || t.Id,
            name: tName,
            capacity: t.capacity || t.Capacity || 4,
            status: t.status || t.Status || 'Available',
            floor: floorVal
          };
        });
        this.groupTablesByFloor();
      },
      error: (err) => console.error('Error fetching tables layout:', err)
    });
  }

  groupTablesByFloor(): void {
    this.groupedTables = {};
    this.restaurantTables.forEach(table => {
      const fName = table.floor || 'Ground Floor';
      if (!this.groupedTables[fName]) this.groupedTables[fName] = [];
      this.groupedTables[fName].push(table);
    });
  }

  selectTableNode(table: RestaurantTable): void {
    if (table.status === 'Occupied' || table.status === 'Reserved') return;
    this.selectedTableId = table.id;
    this.selectedTable = table.name;
    this.isTableDropdownOpen = false;
  }

  addToCart(product: PosProduct): void {
    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
      existing.total = existing.quantity * existing.price;
    } else {
      this.cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      });
    }
    this.recalculateSummaryValues();
  }

  updateQuantity(item: CartItem, delta: number): void {
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    } else {
      item.total = item.quantity * item.price;
    }
    this.recalculateSummaryValues();
  }

  getCartSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.total, 0);
  }

  recalculateSummaryValues(): void {
    const subtotal = this.getCartSubtotal();
    this.totalTax = subtotal * this.taxRate;
    this.grandTotal = subtotal + this.totalTax;
  }

  clearCart(): void {
    this.cartItems = [];
    this.customerName = '';
    this.selectedTable = 'Select Table';
    this.selectedTableId = null;
    this.recalculateSummaryValues();
  }

  openSplitPaymentDrawer(): void {
    if (this.cartItems.length === 0) return;

    // Safety check: Alert user to select a valid dining node before popping payment overlay matrix
    if (this.customerType === 'Dine-In' && !this.selectedTableId) {
      alert('Please select a dining table before settling the invoice.');
      return;
    }

    this.recalculateSummaryValues();
    this.splitPayments = [{ method: 'Cash', amount: Number(this.grandTotal.toFixed(2)) }];
    this.isSplitPaymentModalOpen = true;
  }

  filterByCategory(catId: string): void {
    this.selectedCategory = catId;
    this.filterProducts();
  }

  filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchCat = this.selectedCategory === 'ALL' || p.categoryId === this.selectedCategory;
      const matchQuery = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }


//
processCheckoutReceipt(paymentMethod: string): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    let cashValue = 0;
    let cardValue = 0;
    let upiValue = 0;
    const VIRTUAL_POS_TABLE_ID = '00000000-0000-0000-0000-000000000000';

    if (paymentMethod === 'Split') {
      this.splitPayments.forEach(p => {
        if (p.method === 'Cash') cashValue += p.amount;
        if (p.method === 'Card') cardValue += p.amount;
        if (p.method === 'UPI') upiValue += p.amount;
      });

      if (cashValue === 0 && cardValue === 0 && upiValue === 0) {
        cashValue = this.grandTotal;
        paymentMethod = 'Cash';
      }
    } else {
      if (paymentMethod === 'Cash') cashValue = this.grandTotal;
      if (paymentMethod === 'Card') cardValue = this.grandTotal;
      if (paymentMethod === 'UPI') upiValue = this.grandTotal;
    }

    const cleanCustomerName = this.customerName && this.customerName.trim() ? this.customerName.trim() : 'Walk-In Customer';
    // 👇 1. Extract the text value from the HTML bound input field safely
    const cleanWaiterName = this.waiterName && this.waiterName.trim() ? this.waiterName.trim() : 'System Terminal';
    const cleanOrderType = this.customerType || 'Walk-In';

    const orderPayload = {
      customerName: cleanCustomerName,
      waiterName: cleanWaiterName, // 👈 2. ADD THIS FIELD SO IT COMES IN THE PAYLOAD!
      orderType: cleanOrderType,
      paymentMode: paymentMethod,
      cashPaid: cashValue,
      cardPaid: cardValue,
      upiPaid: upiValue,
      tableId: cleanOrderType === 'Dine-In' ? this.selectedTableId : VIRTUAL_POS_TABLE_ID,
      tableName: this.customerType === 'Dine-In' ? this.selectedTable : 'Counter/POS',
      items: this.cartItems.map((item: any) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        selectedVariant: '',
        price: item.price
      }))
    };

    console.log('Sending unified receipt checkout payload:', orderPayload);

    // Send transaction to Backend API Pipeline
    this.orderService.createOrder(orderPayload).subscribe({
      next: (response) => {
        console.log('Backend Verified Save Success:', response);
        this.lastUsedPaymentMethod = paymentMethod;
        this.lastCreatedOrderId = response?.invoiceNo || response?.id || 'ORD-SUCCESS';
        this.lastSettledAmount = this.grandTotal;

        this.isSplitPaymentModalOpen = false;
        this.isSuccessModalOpen = true;
        this.clearCart();
        this.loadRealRestaurantTables();
      },
      error: (err) => {
        console.error('API Pipeline Processing Exception:', err);
        alert('Order placement failed. Please verify API console logs.');
      }
    });
  }
//
  switchTab(tab: 'New Order' | 'On Going Order' | 'Today Order'): void {
    this.activeTab = tab;
  }

  private getRandomEmoji(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes('burger')) return '🍔';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('fry') || name.includes('chips')) return '🍟';
    if (name.includes('coke') || name.includes('drink') || name.includes('soda')) return '🥤';
    if (name.includes('coffee') || name.includes('tea')) return '☕';
    return '🍽️';
  }
}