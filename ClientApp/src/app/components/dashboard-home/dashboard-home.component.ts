import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  // Mocked JSON Telemetry Engine mimicking backend aggregations
  statsSummary: any = {
    totalRevenue: 4825.50,
    totalOrders: 142,
    activeTables: 18,
    averageBill: 33.98
  };

  recentTransactions: any[] = [];
  topSellingItems: any[] = [];

  ngOnInit(): void {
    // Populate layout cards using local data payloads
    this.recentTransactions = [
      { id: 'TX1084', table: 'Table 4', customer: 'John Doe', items: 3, total: 45.50, status: 'Completed', time: '12:42 PM' },
      { id: 'TX1083', table: 'Table 12', customer: 'Sarah Smith', items: 5, total: 112.20, status: 'Completed', time: '12:35 PM' },
      { id: 'TX1082', table: 'Table 9', customer: 'Mike Johnson', items: 2, total: 28.00, status: 'Pending', time: '12:31 PM' },
      { id: 'TX1081', table: 'Table 2', customer: 'Emily Davis', items: 4, total: 64.75, status: 'Completed', time: '12:15 PM' },
      { id: 'TX1080', table: 'Table 7', customer: 'David Wilson', items: 1, total: 15.50, status: 'Cancelled', time: '11:58 AM' }
    ];

    this.topSellingItems = [
      { name: 'Truffle Mushroom Burger', category: 'Main Course', count: 48, percentage: 85, color: '#4f46e5' },
      { name: 'Spicy Salmon Sushi Roll', category: 'Starters', count: 36, percentage: 68, color: '#10b981' },
      { name: 'Wood-Fired Margherita Pizza', category: 'Main Course', count: 32, percentage: 60, color: '#f59e0b' },
      { name: 'Classic Caesar Salad', category: 'Salads', count: 24, percentage: 45, color: '#6366f1' },
      { name: 'Artisanal Chocolate Lava Cake', category: 'Desserts', count: 19, percentage: 32, color: '#ec4899' }
    ];
  }
}