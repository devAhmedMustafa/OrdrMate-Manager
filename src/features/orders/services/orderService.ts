import api from '../../../utils/api';
import PlaceOrderRequestDto from '../../manual-order/PlaceOrderRequest.dto';
import OrderResponse from '../dtos/OrderResponse';
import OrderResponseMapper from '../mappers/orderResponseMapper';
import { OrderStatus } from '../types';
import { orderLocalRepo } from './orderLocalRepo';

class OrderService {

  async getUnpaidOrders(branchId: string): Promise<OrderResponse[]> {
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

  async getAllOrders(): Promise<OrderResponse[]> {
    try {

      const orders = await orderLocalRepo.getAllOrders();
      const orderResponses: OrderResponse[] = [];
      for (const order of orders) {
        const orderResponse = await OrderResponseMapper.fromOrderModel(order);
        orderResponses.push(orderResponse);
      }

      return orderResponses;
    }
    catch(err){
      throw err;
    }
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

  async changeOrderPaymentProvider(orderId: string, provider: string): Promise<void> {
    await api.put(`/UpdateOrder/payment-provider/${orderId}`, { paymentProvider: provider });
  }

}

export const orderService = new OrderService();