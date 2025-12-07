

import { Order, MenuItem, Table, OrderStatus, PaymentStatus, PaymentMethod, Expense } from '../types';

// Initial Mock Data
const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Manchow Soup', category: 'Soups', description: 'Spicy brown soup with fried noodles', priceFull: 180, priceHalf: 100, isVeg: true, image: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Hakka Noodles', category: 'Noodles', description: 'Classic stir-fried noodles with veggies', priceFull: 220, priceHalf: 120, isVeg: true, image: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Schezwan Fried Rice', category: 'Rice', description: 'Spicy rice tossed in schezwan sauce', priceFull: 240, priceHalf: 130, isVeg: false, image: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Chilli Chicken', category: 'Starters', description: 'Diced chicken in spicy soy sauce', priceFull: 300, priceHalf: 180, isVeg: false, image: 'https://picsum.photos/200/200?random=4' },
  { id: '5', name: 'Spring Rolls', category: 'Starters', description: 'Crispy rolls with veggie filling', priceFull: 180, priceHalf: undefined, isVeg: true, image: 'https://picsum.photos/200/200?random=5' },
];

const INITIAL_TABLES: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  qrCode: `https://kraftykitchen.app/order/${i + 1}`
}));

const STORAGE_KEYS = {
  ORDERS: 'gd_orders',
  MENU: 'gd_menu',
  TABLES: 'gd_tables',
  EXPENSES: 'gd_expenses',
  TOKEN_CTR: 'gd_token_ctr',
  TOKEN_DATE: 'gd_token_date'
};

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOKEN_CTR)) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_CTR, '0');
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOKEN_DATE)) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_DATE, new Date().toDateString());
    }
  }

  // --- MENU ---
  getMenu(): MenuItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || '[]');
  }

  addMenuItem(item: MenuItem) {
    const menu = this.getMenu();
    menu.push(item);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }

  deleteMenuItem(id: string) {
    const menu = this.getMenu().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }

  // --- TABLES ---
  getTables(): Table[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || '[]');
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  createOrder(orderData: Partial<Order>): Order {
    const orders = this.getOrders();
    
    // Generate Token with 24-hour reset logic
    const todayStr = new Date().toDateString();
    const lastTokenDate = localStorage.getItem(STORAGE_KEYS.TOKEN_DATE);
    let tokenCtr = parseInt(localStorage.getItem(STORAGE_KEYS.TOKEN_CTR) || '0');

    if (lastTokenDate !== todayStr) {
      tokenCtr = 1;
      localStorage.setItem(STORAGE_KEYS.TOKEN_DATE, todayStr);
    } else {
      tokenCtr++;
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN_CTR, tokenCtr.toString());
    const token = `HCN-${tokenCtr.toString().padStart(3, '0')}`;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      token,
      status: OrderStatus.PENDING,
      paymentStatus: orderData.paymentMethod === PaymentMethod.ONLINE ? PaymentStatus.PAID : PaymentStatus.PENDING,
      createdAt: Date.now(),
      estimatedTime: 10,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      tableId: orderData.tableId || '0',
      paymentMethod: orderData.paymentMethod || PaymentMethod.CASH,
      customerDetails: orderData.customerDetails || { name: 'Guest', phone: 'N/A', address: 'Dine-in' }
    };

    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  updateWaitTime(orderId: string, minutes: number) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].estimatedTime = minutes;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  // --- EXPENSES ---
  getExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  }

  addExpense(expense: Expense) {
    const expenses = this.getExpenses();
    expenses.push(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  deleteExpense(id: string) {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // --- ANALYTICS ---
  getStats() {
    const orders = this.getOrders();
    const expenses = this.getExpenses();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayTs = today.getTime();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0,0,0,0);
    const monthTs = monthStart.getTime();

    const todaysOrders = orders.filter(o => o.createdAt >= todayTs);
    const monthsOrders = orders.filter(o => o.createdAt >= monthTs);
    
    // Revenue
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.paymentStatus === PaymentStatus.PAID ? curr.totalAmount : 0), 0);
    const todayRevenue = todaysOrders.reduce((acc, curr) => acc + (curr.paymentStatus === PaymentStatus.PAID ? curr.totalAmount : 0), 0);
    const monthRevenue = monthsOrders.reduce((acc, curr) => acc + (curr.paymentStatus === PaymentStatus.PAID ? curr.totalAmount : 0), 0);

    // Expenses
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const todayExpenses = expenses.filter(e => e.date >= todayTs).reduce((acc, curr) => acc + curr.amount, 0);
    const monthExpenses = expenses.filter(e => e.date >= monthTs).reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders: orders.length,
      activeOrders: orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length,
      
      // Financials
      totalExpenses,
      todayExpenses,
      monthExpenses,
      todayProfit: todayRevenue - todayExpenses,
      monthProfit: monthRevenue - monthExpenses
    };
  }
}

export const db = new DatabaseService();