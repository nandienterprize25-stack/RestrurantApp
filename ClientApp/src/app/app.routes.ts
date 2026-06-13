import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { MenuComponent } from './components/menu/menu.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PosInvoiceComponent } from './components/pos-invoice/pos-invoice.component'; // Import New Component
import { OrderListComponent } from './components/order-list/order-list.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'orders/pos-invoice', component: PosInvoiceComponent }, // Bind the path from sidebar links
      { path: 'orders/order-list', component: OrderListComponent }, // 👈 Map navigation link channel route here
    { 
        path: 'orders/kitchen-display', 
        loadComponent: () => import('./components/kitchen-display/kitchen-display.component').then(m => m.KitchenDisplayComponent) 
      },

      // 🗂️ MANAGE CATEGORY MODULE PATHS
    // 📁 REGISTERED: Category List Directory Route Channel
      { 
        path: 'category/list', 
        loadComponent: () => import('./components/category-list/category-list.component').then(m => m.CategoryListComponent) 
      },
      // 🍔 MANAGE FOOD MODULE PATHS
      { path: 'food/add', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'food/list', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) }, // 👈 This is your main dishes grid!
      { path: 'food/add-group', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'food/variants', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'food/availability', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'food/menu-types', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },

      // ➕ MENU ADD-ONS MODULE PATHS
      { path: 'addons/add', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'addons/list', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'addons/assign-list', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },
      { path: 'menu', component: MenuComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: OrdersComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];