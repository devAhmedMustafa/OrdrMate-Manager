import api from '../../../utils/api';

export interface OrderItem {
  OrderId: string;
  OrderDate: string;
  ItemName: string;
  KitchenName: string;
  ItemId: string;
  KitchenUnitId: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
  Notes?: string;
}

export enum OrderStatus {
  Pending = 0,
  Queued = 1,
  InProgress = 2,
  Ready = 3,
  Delivered = 4,
  Cancelled = -1
}

export interface Order {
  OrderId: string;
  Items: OrderItem[];
  Status: OrderStatus;
  IsBeingPrepared: boolean;
  NextItem?: OrderItem;
}

export interface UnpaidOrder {
  orderId: string;
  restaurantName: string;
  customer: string;
  orderType: string;
  paymentMethod: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  branchId: string;
  isPaid: boolean;
  orderNumber: number;
  tableNumber: number;
}

export const orderService = {
  // WebSocket connection
  getWebSocketUrl: (branchId: string): string => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = isDevelopment ? 'localhost:5126' : 'ordrmate.starplusgames.com';
    return `${wsProtocol}//${baseUrl}/ws/orders/${branchId}`;
  },

  // Fetch unpaid orders
  getUnpaidOrders: async (branchId: string, token: string): Promise<UnpaidOrder[]> => {
    const response = await api.get(`/Order/unpaid/${branchId}`);
    return response.data;
  },

  // Mark order as paid manually
  markAsPaid: async (orderId: string, token: string): Promise<void> => {
    await api.post(`/Order/${orderId}/pay`);
  },

  // Mark item as prepared
  markItemAsPrepared: async (
    branchId: string,
    kitchenName: string,
    kitchenUnitId: string,
    token: string
  ): Promise<void> => {
    await api.post(`/Order/prepare/${branchId}/${kitchenName}/${kitchenUnitId}`);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, token: string): Promise<void> => {
    await api.put(`/Order/${orderId}/status`, { status });
  }
}; 