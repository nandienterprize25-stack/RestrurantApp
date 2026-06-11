import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component'; // New Add
import { MenuComponent } from './components/menu/menu.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      // Redirect directly to our beautiful new administrative telemetry grid
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: OrdersComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];