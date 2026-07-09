import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TransactionItem {
  invoiceNo: string;
  tableName: string;
  customerName: string;
  itemsCount: number;
  grandTotal: number;
  orderStatus: 'Completed' | 'Pending' | 'Cancelled';
  orderDate: string;
}

interface MenuItemMetrics {
  foodName: string;
  categoryName: string;
  quantitySold: number;
  performancePercentage: number;
  barColorHex: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  
  // Real-time metric variables directly bound to the template
  totalRevenue: number = 4825.50;
  totalOrdersCount: number = 142;
  occupiedTablesCount: number = 18;
  totalTablesAvailable: number = 25;
  avgTicketValue: number = 33.98;

  // Explicit arrays matched precisely with HTML template variables
  recentTransactions: TransactionItem[] = [];
  topSellingMenuItems: MenuItemMetrics[] = [];

  ngOnInit(): void {
    this.recentTransactions = [
      { invoiceNo: 'TX1084', tableName: 'Table 4', customerName: 'John Doe', itemsCount: 3, grandTotal: 45.50, orderStatus: 'Completed', orderDate: '12:42 PM' },
      { invoiceNo: 'TX1083', tableName: 'Table 12', customerName: 'Sarah Smith', itemsCount: 5, grandTotal: 112.20, orderStatus: 'Completed', orderDate: '12:35 PM' },
      { invoiceNo: 'TX1082', tableName: 'Table 9', customerName: 'Mike Johnson', itemsCount: 2, grandTotal: 28.00, orderStatus: 'Pending', orderDate: '12:31 PM' },
      { invoiceNo: 'TX1081', tableName: 'Table 2', customerName: 'Emily Davis', itemsCount: 4, grandTotal: 64.75, orderStatus: 'Completed', orderDate: '12:15 PM' },
      { invoiceNo: 'TX1080', tableName: 'Table 7', customerName: 'David Wilson', itemsCount: 1, grandTotal: 15.50, orderStatus: 'Cancelled', orderDate: '11:58 AM' }
    ];

    this.topSellingMenuItems = [
      { foodName: 'Truffle Mushroom Burger', categoryName: 'Main Course', quantitySold: 48, performancePercentage: 85, barColorHex: '#4f46e5' },
      { foodName: 'Spicy Salmon Sushi Roll', categoryName: 'Starters', quantitySold: 36, performancePercentage: 68, barColorHex: '#10b981' },
      { foodName: 'Wood-Fired Margherita Pizza', categoryName: 'Main Course', quantitySold: 32, performancePercentage: 60, barColorHex: '#f59e0b' },
      { foodName: 'Classic Caesar Salad', categoryName: 'Salads', quantitySold: 24, performancePercentage: 45, barColorHex: '#6366f1' },
      { foodName: 'Artisanal Chocolate Lava Cake', categoryName: 'Desserts', quantitySold: 19, performancePercentage: 32, barColorHex: '#ec4899' }
    ];
  }

  // Declared click interaction method explicitly to pass compilation constraints
  logout(): void {
    console.log('User signed out successfully.');
  }
}