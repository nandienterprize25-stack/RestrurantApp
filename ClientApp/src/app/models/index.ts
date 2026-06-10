export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  createdById: string;
  createdByUsername: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface CreateOrderRequest {
  tableId: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}
