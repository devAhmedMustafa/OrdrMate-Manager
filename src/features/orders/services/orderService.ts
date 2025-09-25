import api from '../../../utils/api';
import PlaceOrderRequestDto from '../../manual-order/PlaceOrderRequest.dto';
import { OrderStatus, Order, UnpaidOrder } from '../types';

export interface CheckPreparedResponse {
  dequedItemId: string;
  nextItemId: string;
}

class OrderService {

  async getUnpaidOrders(branchId: string): Promise<UnpaidOrder[]> {
    const response = await api.get(`/Order/unpaid/${branchId}`);
    return response.data;
  }

  async markAsPaid(orderId: string): Promise<void> {
    await api.put(`/Order/mark_paid/${orderId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await api.put(`/Order/${orderId}/status`, { status: OrderStatus[status] });
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
      Status: OrderStatus[order.orderStatus] || OrderStatus[OrderStatus.Pending],
      IsBeingPrepared: false,
      OrderType: order.orderType,
      OrderDate: order.orderDate,
      TotalAmount: order.totalAmount,
      IsPaid: order.isPaid,
      Customer: order.customer
    }));
  }

  async getTakeawayOrders(branchId: string): Promise<any[]> {
    const response = await api.get(`/Order/takeaways/${branchId}`);
    return response.data;
  }

  async requestOrderPickup(orderId: string): Promise<void> {
    await api.post('/Order/deliver_request', { orderId });
  }

  async placeOrder(request: PlaceOrderRequestDto): Promise<void> {
    await api.post('/Order/create-order', request);
  }

  async setOrderAsReady(orderId: string): Promise<void> {
    await api.put(`/UpdateOrder/set-ready/${orderId}`);
  }

  async getOrderQueueByBranch(branchId: string): Promise<Order[]> {
    const response = await api.get(`/Order/branch-queue/${branchId}`);
    return response.data;
  }
  
}

export const orderService = new OrderService();