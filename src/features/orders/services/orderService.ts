import api from '../../../utils/api';
import QueueInvoker from '../../../utils/QueueInvoker';
import PlaceOrderRequestDto from '../../manual-order/PlaceOrderRequest.dto';
import OnlineEvent from '../../offline-support/OnlineEvent';
import TableReservation from '../../tables/models/TableReservation';
import { tableLocalRepo } from '../../tables/services/tableLocalRepo';
import OrderResponse from '../dtos/OrderResponse';
import OrderMapper from '../mappers/orderMapper';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import { OrderStatus } from '../types';
import { orderCloudService } from './orderCloudService';
import { orderLocalRepo } from './orderLocalRepo';

class OrderService {

  async getUnpaidOrders(branchId: string): Promise<OrderResponse[]> {
    return await orderCloudService.getUnpaidOrders(branchId);
  }

  async markAsPaid(orderId: string): Promise<void> {
    await orderCloudService.markAsPaid(orderId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await orderCloudService.updateOrderStatus(orderId, status);
  }

  async markItemAsPrepared(branchId: string, kitchenName: string, kitchenUnitId: string): Promise<void> {
    await orderCloudService.markItemAsPrepared(branchId, kitchenName, kitchenUnitId);
  }

  async getAllOrders(branchId: string): Promise<OrderResponse[]> {
    try {
      if (OnlineEvent.getInstance().isOnline) {
        const orders = await orderCloudService.getAllOrders(branchId);
        await orderLocalRepo.syncOrders(orders.map(o => OrderMapper.fromResponseToModel(o)));
        return orders;
      } else {
        const localOrders = await orderLocalRepo.getAllOrders();
        return await Promise.all(localOrders.map((o) => OrderMapper.fromModelToResponse(o)));
      }
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
    try {
      const totalAmount = request.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = new Order({
        customerId: "LOCAL",
        branchId: request.branchId,
        orderType: request.orderType,
        totalAmount: totalAmount
      });

      // Create order items
      request.items.forEach(async item => {
        const orderItem = new OrderItem({
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity
        });
        await orderLocalRepo.addOrderItem(orderItem);
      });

      // Create table reservation if applicable
      if (request.tableNumber) {
        const tableReservation = new TableReservation({
          branchId: request.branchId,
          customerId: "LOCAL",
          tableNumber: request.tableNumber,
        });
        await tableLocalRepo.addTableReservation(tableReservation);
      }

      await orderLocalRepo.addOrder(order);

      QueueInvoker.getInstance().enqueue(async () => {
        await orderCloudService.pushOrder({
          order: order,
          items: request.items,
          tableNumber: request.tableNumber
        });
      });
    }
    catch (err) {
      throw err;
    }
  }

  async setOrderAsReady(orderId: string): Promise<void> {
    await api.put(`/UpdateOrder/set-ready/${orderId}`);
  }

  async changeOrderPaymentProvider(orderId: string, provider: string): Promise<void> {
    await api.put(`/UpdateOrder/payment-provider/${orderId}`, { paymentProvider: provider });
  }

}

export const orderService = new OrderService();