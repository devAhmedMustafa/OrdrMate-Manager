import api from '../../../utils/api';
import { OrderStatus, Order, UnpaidOrder } from '../types';

export interface CheckPreparedResponse {
  dequedItemId: string;
  nextItemId: string;
}

class OrderService {
  async getItemQueues(branchId: string): Promise<Record<string, Order[]>> {
    const response = await api.get(`/Order/item_queues/${branchId}`);
    const items: any[] = response.data;
    
    // Group items by kitchen name
    const queues: Record<string, Order[]> = {};
    
    items.forEach(item => {
      if (!item.kitchenName) return;

      // Ensure KitchenUnitId is set
      if (!item.kitchenUnitId) {
        item.kitchenUnitId = '0';
      }

      if (!queues[item.kitchenName]) {
        queues[item.kitchenName] = [];
      }

      const existingOrder = queues[item.kitchenName].find(order => order.OrderId === item.orderId);
      if (existingOrder) {
        existingOrder.Items.push({
          OrderId: item.orderId,
          OrderDate: item.orderDate,
          ItemName: item.itemName,
          KitchenName: item.kitchenName,
          ItemId: item.itemId,
          KitchenUnitId: item.kitchenUnitId.toString(),
          Price: item.price,
          Quantity: item.quantity,
          ImageUrl: item.imageUrl
        });
      } else {
        queues[item.kitchenName].push({
          OrderId: item.orderId,
          Items: [{
            OrderId: item.orderId,
            OrderDate: item.orderDate,
            ItemName: item.itemName,
            KitchenName: item.kitchenName,
            ItemId: item.itemId,
            KitchenUnitId: item.kitchenUnitId.toString(),
            Price: item.price,
            Quantity: item.quantity,
            ImageUrl: item.imageUrl
          }],
          Status: 'Pending' as OrderStatus,
          IsBeingPrepared: false
        });
      }
    });

    return queues;
  }

  async getUnpaidOrders(branchId: string): Promise<UnpaidOrder[]> {
    const response = await api.get(`/Order/unpaid/${branchId}`);
    return response.data;
  }

  async markAsPaid(orderId: string): Promise<void> {
    await api.post(`/Order/${orderId}/mark-as-paid`);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await api.put(`/Order/${orderId}/status`, { status: status.toString() });
  }

  async markItemAsPrepared(branchId: string, kitchenName: string, kitchenUnitId: string): Promise<void> {
    await api.post(`/Order/check-prepared/${branchId}/${kitchenName}/${kitchenUnitId}`);
  }

  async checkItemAsPrepared(
    branchId: string,
    kitchenName: string,
    kitchenUnitId: string,
    token: string
  ): Promise<CheckPreparedResponse> {
    const response = await api.post(`/Order/check-prepared/${branchId}/${kitchenName}/${kitchenUnitId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  async getAllOrders(branchId: string): Promise<Order[]> {
    const response = await api.get(`/Order/list/${branchId}`);
    return response.data.map((order: any) => ({
      OrderId: order.orderId,
      Items: [], // Items will be populated separately
      Status: order.orderStatus as OrderStatus,
      IsBeingPrepared: false,
      OrderType: order.orderType,
      OrderDate: order.orderDate,
      TotalAmount: order.totalAmount,
      IsPaid: order.isPaid,
      Customer: order.customer
    }));
  }
}

export const orderService = new OrderService();