import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface SubMenuItem {
  label: string;
  route: string;
}

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  subMenus?: SubMenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: any = null;
  
  // Production-ready complete ERP navigation menu data schema
  navigationMenu: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    
    {
      label: 'Manage Order',
      icon: '🛒',
      isExpanded: false,
      subMenus: [
        { label: 'POS Invoice', route: '/orders/pos-invoice' },
        { label: 'Order List', route: '/orders/order-list' },
        // 👈 ADDED LIVE KITCHEN DISPLAY MONITOR ROUTE CHANNEL HERE
        { label: 'Kitchen Monitor (KDS)', route: '/orders/kitchen-display' },
        { label: 'Pending Order', route: '/orders/pending' },
        { label: 'Completed With Payment', route: '/orders/completed-paid' },
        { label: 'Completed with Due', route: '/orders/completed-due' },
        { label: 'Cancel Order', route: '/orders/cancelled' },
        { label: 'Kitchen Dashboard', route: '/orders/kitchen-deck' },
        { label: 'Counter Dashboard', route: '/orders/counter-deck' },
        { label: 'Counter List', route: '/orders/counters' },
        { label: 'POS Setting', route: '/orders/pos-settings' },
        { label: 'Sound Setting', route: '/orders/sound-settings' },
        { label: 'RMS to PMS sync', route: '/orders/pms-sync' }
      ]
    },
    {
      label: 'Reservation',
      icon: '📅',
      isExpanded: false,
      subMenus: [
        { label: 'Book Table', route: '/reservation/book' },
        { label: 'Reservation Log', route: '/reservation/log' },
        { label: 'Availability Matrix', route: '/reservation/availability' },
        { label: 'Floor Plan Layout', route: '/reservation/floor-plan' }
      ]
    },
    {
      label: 'Purchase Order',
      icon: '📦',
      isExpanded: false,
      subMenus: [
        { label: 'Purchase Items', route: '/purchase/items' },
        { label: 'Supplier Registry', route: '/purchase/suppliers' },
        { label: 'Purchase Invoices', route: '/purchase/invoices' },
        { label: 'Stock Reorder Alerts', route: '/purchase/reorder' }
      ]
    },
    // {
    //   label: 'Food Management',
    //   icon: '📜',
    //   isExpanded: false,
    //   subMenus: [
    // { label: 'Menu Dishes Grid', route: '/food-management/menu-items' },
    //     { label: 'Categories Layout', route: '/food-management/categories' },
    //     { label: 'Food Addons Setup', route: '/food-management/addons' },
    //     { label: 'Variants & Size Matrix', route: '/food-management/variants' },
    //     { label: 'Availability Schedules', route: '/food-management/availability' },
    //     { label: 'Combo & Group Items', route: '/food-management/combos' }
    //   ]
    // },
    // 🗂️ 1. MANAGE CATEGORY DRAWER
    {
      label: 'Manage Category',
      icon: '📁',
      isExpanded: false,
      subMenus: [
        { label: 'Category List', route: '/category/list' }
      ]
    },

    // 🍔 2. MANAGE FOOD DRAWER
    {
      label: 'Manage Food',
      icon: '🍕',
      isExpanded: false,
      subMenus: [
        { label: 'Food List', route: '/food/list' },
        { label: 'Add Group Item', route: '/manage-combos' },
        // 👇 FIX THIS LINE: Ensure the route matches 'app.routes.ts' exactly!
    { label: 'Food Variants', route: '/food/variants' },
        { label: 'Food Availability', route: '/food/availability' },
        { label: 'Menu Type', route: '/food/menu-types' }
      ]
    },

    // ➕ 3. MENU ADD-ONS DRAWER
    {
      label: 'Menu Add-ons',
      icon: '🧂',
      isExpanded: false,
      subMenus: [
        { label: 'Add Add-ons', route: '/addons/add' },
        { label: 'Add-ons List', route: '/addons/list' },
        { label: 'Add-ons Assign List', route: '/addons/assign-list' }
      ]
    },
    {
      label: 'Production',
      icon: '🍳',
      isExpanded: false,
      subMenus: [
        { label: 'Batch Processing', route: '/production/batches' },
        { label: 'Raw Component Yield', route: '/production/yield' },
        { label: 'Production Forecast', route: '/production/forecast' }
      ]
    },
    {
      label: 'Human Resource',
      icon: '👥',
      isExpanded: false,
      subMenus: [
        { label: 'Employee Registry', route: '/hr/employees' },
        { label: 'Attendance Tracking', route: '/hr/attendance' },
        { label: 'Shift Roster Control', route: '/hr/shifts' },
        { label: 'Payroll & Allowances', route: '/hr/payroll' }
      ]
    },
    {
      label: 'Allow Order Edit',
      icon: '✏️',
      isExpanded: false,
      subMenus: [
        { label: 'Pending Modifications', route: '/edit-requests/pending' },
        { label: 'Manager Permissions Override', route: '/edit-requests/override' },
        { label: 'Adjustment Ledger Logs', route: '/edit-requests/logs' }
      ]
    },
    {
      label: 'Reports',
      icon: '📈',
      isExpanded: false,
      subMenus: [
        { label: 'Daily Sales Statement', route: '/reports/sales' },
        { label: 'Z-Report Summary', route: '/reports/z-out' },
        { label: 'Financial Statements', route: '/reports/financial' },
        { label: 'Item Performance Matrix', route: '/reports/items' },
        { label: 'Audit Trail Activity Logs', route: '/reports/audit' }
      ]
    },
    {
      label: 'Waste Tracking',
      icon: '🗑️',
      isExpanded: false,
      subMenus: [
        { label: 'Log Spoiled Stock', route: '/waste/log' },
        { label: 'Expired Inventory Ledger', route: '/waste/expired' },
        { label: 'Loss & Analytics Report', route: '/waste/analytics' }
      ]
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSubMenu(item: MenuItem): void {
    if (item.subMenus) {
      // Clean accordion mechanism: collapse other drawers while opening the targeted node
      this.navigationMenu.forEach(m => {
        if (m !== item) m.isExpanded = false;
      });
      item.isExpanded = !item.isExpanded;
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}