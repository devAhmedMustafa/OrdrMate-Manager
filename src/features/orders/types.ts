export enum OrderStatus {
  Pending = 0,
  Queued = 1,
  InProgress = 2,
  Ready = 3,
  Delivered = 4,
  Cancelled = -1
}

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

export interface OrderStatusUpdate {
  OrderId: string;
  OrderStatus: OrderStatus;
}

export interface Order {
  OrderId: string;
  Items: OrderItem[];
  Status: OrderStatus;
  IsBeingPrepared: boolean;
  NextItem?: OrderItem;
}

export interface KitchenQueue {
  KitchenName: string;
  Orders: Order[];
  NextItem?: OrderItem;
}

export interface UnpaidOrder {
  orderId: string;
  orderNumber: string;
  orderType: string;
  customer: string;
  tableNumber?: number;
  paymentMethod: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
}

export type WebSocketMessage = {
  Type: 'InitialData' | 'NewItem' | 'OrderPlaced' | 'NextItem' | 'OrderReady';
  items?: OrderItem[];
  Item?: OrderItem;
  OrderId?: string;
  IsBeingPrepared?: boolean;
} 