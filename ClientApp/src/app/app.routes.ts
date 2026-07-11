// import { Routes } from '@angular/router';
// import { LoginComponent } from './components/login/login.component';
// import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
// import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
// import { MenuComponent } from './components/menu/menu.component';
// import { CheckoutComponent } from './components/checkout/checkout.component';
// import { OrdersComponent } from './components/orders/orders.component';
// import { PosInvoiceComponent } from './components/pos-invoice/pos-invoice.component'; // Import New Component
// import { OrderListComponent } from './components/order-list/order-list.component';



// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   {
//     path: '',
//     component: DashboardLayoutComponent,
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: DashboardHomeComponent },
//       { path: 'orders/pos-invoice', component: PosInvoiceComponent }, // Bind the path from sidebar links
//       { path: 'orders/order-list', component: OrderListComponent }, // 👈 Map navigation link channel route here
//       {
//         path: 'orders/kitchen-display',
//         loadComponent: () => import('./components/kitchen-display/kitchen-display.component').then(m => m.KitchenDisplayComponent)
//       },

//       // 🗂️ MANAGE CATEGORY MODULE PATHS
//       // 📁 REGISTERED: Category List Directory Route Channel
//       {
//         path: 'category/list',
//         loadComponent: () => import('./components/category-list/category-list.component').then(m => m.CategoryListComponent)
//       },
//       // 🍔 MANAGE FOOD MODULE PATHS
//       { path: 'food/list', loadComponent: () => import('./components/food-list/food-list.component').then(m => m.FoodListComponent) }, // 👈 This is your main dishes grid!
//       {
//         path: 'manage-combos',
//         loadComponent: () => import('./components/create-combo-item/create-combo-item').then(m => m.CreateComboItemComponent)
//       },

//       // Look for the 'food/add-group' line path channel and update it to lazy load your layout exactly like this:
//       {
//         path: 'food/add-group',
//         loadComponent: () => import('./components/group-item-list/group-item-list.component').then(m => m.GroupItemListComponent)
//       },
//       { path: 'food/variants', loadComponent: () => import('./components/food-variant-list/food-variant-list.component').then(m => m.FoodVariantListComponent) },
//       { path: 'food/availability', loadComponent: () => import('./components/food-list/food-list.component').then(m => m.FoodListComponent) },
//       { path: 'food/menu-types', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },

//       // ➕ MENU ADD-ONS MODULE PATHS
//       { path: 'addons/create', loadComponent: () => import('./components/create-addon-item/create-addon-item').then(m => m.CreateAddonItemComponent) },
//       { path: 'addons/assign', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },

//       { path: 'addons/add', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
//       { path: 'addons/list', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
//       { path: 'addons/assign-list', loadComponent: () => import('./components/addons-assign-list/addons-assign-list.component').then(m => m.AddonsAssignListComponent) },
//       { path: 'addons/assign', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
//       { path: 'menu', component: MenuComponent },
//       { path: 'checkout', component: CheckoutComponent },
//       { path: 'orders', component: OrdersComponent },
//       { path: '**', redirectTo: 'dashboard' }
//     ]
//   },
//   //Add Reservation Dashboard Route
//   // Add these items inside the children block array alongside your existing route lists:

//   // 📅 RESERVATION MANAGEMENT SYSTEM PIPELINE ROUTES
//   // Swap out the reservation block inside your children array inside app.routes.ts[cite: 20]:
// // { 
// //   path: 'reservation/food-booking', 
// //   loadComponent: () => import('./components/reservations/food-booking/food-booking.component').then(m => m.FoodBookingComponent) 
// // },
// // { 
// //   path: 'reservation/take-order', 
// //   loadComponent: () => import('./components/reservations/take-order/take-order.component').then(m => m.TakeOrderComponent) 
// // },
// // { 
// //   path: 'reservation/list', 
// //   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// // },
// // { 
// //   path: 'reservation/add-booking', 
// //   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// // },
// // { 
// //   path: 'reservation/unavailable-day', 
// //   loadComponent: () => import('./components/reservations/unavailable-day/unavailable-day.component').then(m => m.UnavailableDayComponent) 
// // },
// // { 
// //   path: 'reservation/setting', 
// //   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// // },
// // 📅 CORRECTED RESERVATION MODULE PATH ROUTING CONTEXT
// { 
//   path: 'reservation/food-booking', 
//   loadComponent: () => import('./components/reservations/food-booking/food-booking.component').then(m => m.FoodBookingComponent) 
// },
// { 
//   path: 'reservation/take-order', 
//   loadComponent: () => import('./components/reservations/take-order/take-order.component').then(m => m.TakeOrderComponent) 
// },
// { 
//   path: 'reservation/list', 
//   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// },
// { 
//   path: 'reservation/add-booking', 
//   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// },
// { 
//   path: 'reservation/unavailable-day', 
//   loadComponent: () => import('./components/reservations/unavailable-day/unavailable-day.component').then(m => m.UnavailableDayComponent) 
// },
// { 
//   path: 'reservation/setting', 
//   loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
// },
//   //
//   { path: '**', redirectTo: 'login' }
// ];


import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { MenuComponent } from './components/menu/menu.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PosInvoiceComponent } from './components/pos-invoice/pos-invoice.component'; 
import { OrderListComponent } from './components/order-list/order-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'orders/pos-invoice', component: PosInvoiceComponent }, 
      { path: 'orders/order-list', component: OrderListComponent }, 
      {
        path: 'orders/kitchen-display',
        loadComponent: () => import('./components/kitchen-display/kitchen-display.component').then(m => m.KitchenDisplayComponent)
      },

      // 🗂️ MANAGE CATEGORY MODULE PATHS
      {
        path: 'category/list',
        loadComponent: () => import('./components/category-list/category-list.component').then(m => m.CategoryListComponent)
      },

      // 🍔 MANAGE FOOD MODULE PATHS
      { path: 'food/list', loadComponent: () => import('./components/food-list/food-list.component').then(m => m.FoodListComponent) }, 
      {
        path: 'manage-combos',
        loadComponent: () => import('./components/create-combo-item/create-combo-item').then(m => m.CreateComboItemComponent)
      },
      {
        path: 'food/add-group',
        loadComponent: () => import('./components/group-item-list/group-item-list.component').then(m => m.GroupItemListComponent)
      },
      { path: 'food/variants', loadComponent: () => import('./components/food-variant-list/food-variant-list.component').then(m => m.FoodVariantListComponent) },
      { path: 'food/availability', loadComponent: () => import('./components/food-list/food-list.component').then(m => m.FoodListComponent) },
      { path: 'food/menu-types', loadComponent: () => import('./components/menu-item-list/menu-item-list.component').then(m => m.MenuItemListComponent) },

      // ➕ MENU ADD-ONS MODULE PATHS
      { path: 'addons/create', loadComponent: () => import('./components/create-addon-item/create-addon-item').then(m => m.CreateAddonItemComponent) },
      { path: 'addons/assign', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
      { path: 'addons/add', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
      { path: 'addons/list', loadComponent: () => import('./components/assign-addon-item/assign-addon-item').then(m => m.AssignAddonItemComponent) },
      { path: 'addons/assign-list', loadComponent: () => import('./components/addons-assign-list/addons-assign-list.component').then(m => m.AddonsAssignListComponent) },
      
      { path: 'menu', component: MenuComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: OrdersComponent },

      // 📅 RESERVATION MANAGEMENT SYSTEM PIPELINE ROUTES (MOVED INSIDE CHILDREN ARRAY) 👇
      { 
        path: 'reservation/food-booking', 
        loadComponent: () => import('./components/reservations/food-booking/food-booking.component').then(m => m.FoodBookingComponent) 
      },
      { 
        path: 'reservation/take-order', 
        loadComponent: () => import('./components/reservations/take-order/take-order.component').then(m => m.TakeOrderComponent) 
      },
      { 
        path: 'reservation/list', 
        loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
      },
      { 
        path: 'reservation/add-booking', 
        loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
      },
      { 
        path: 'reservation/unavailable-day', 
        loadComponent: () => import('./components/reservations/unavailable-day/unavailable-day.component').then(m => m.UnavailableDayComponent) 
      },
      { 
        path: 'reservation/setting', 
        loadComponent: () => import('./components/reservations/table-reservation/table-reservation.component').then(m => m.TableReservationComponent) 
      },

      // Fallback redirect for broken sub-links inside layout
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  // Global wildcard fallback handler
  { path: '**', redirectTo: 'login' }
];