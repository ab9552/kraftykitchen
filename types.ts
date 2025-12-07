
export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE'
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  priceFull: number;
  priceHalf?: number;
  isVeg: boolean;
  image: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  variant: 'Full' | 'Half';
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string; // Internal UUID
  token: string; // User facing e.g., HCN-001
  tableId: string;
  customerDetails: CustomerDetails;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: number;
  estimatedTime: number; // in minutes
  chefNote?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: number; // timestamp
}

export interface Table {
  id: string;
  number: number;
  qrCode: string; // URL
}

export interface Category {
  id: string;
  name: string;
}
