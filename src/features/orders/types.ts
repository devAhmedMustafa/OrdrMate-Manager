import { MenuItem } from "../items/services/itemService";

export enum OrderStatus {
  Pending = 0,
  Queued = 1,
  InProgress = 2,
  Ready = 3,
  Delivered = 4,
  Cancelled = -1
}

export interface OrderItem {
  orderId: string;
  itemId: string;
  price: number;
  quantity: number;
  item: MenuItem;
}

export interface OrderStatusUpdate {
  orderId: string;
  orderStatus: OrderStatus;
}

export interface Order {
  orderId: string;
  orderItems: OrderItem[];
  orderStatus: string;
  orderType: string;
  orderDate: string;
  totalAmount: number;
  isPaid: boolean;
  customer: string;
  orderNumber?: number | null;
}

export interface UnpaidOrder {
  orderId: string;
  orderNumber: string | null;
  orderType: string | null;
  customer: string;
  tableNumber?: number;
  paymentMethod: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus | string;
}

export type WebSocketMessage = {
  Type: 'InitialData' | 'NewItem' | 'OrderPlaced' | 'NextItem' | 'OrderReady';
  items?: OrderItem[];
  Item?: OrderItem;
  OrderId?: string;
  IsBeingPrepared?: boolean;
} 