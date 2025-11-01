import api from '../../../utils/api';
import OrderResponse from '../../orders/dtos/OrderResponse';
import OrderItemResponse from '../../orders/dtos/OrderItemResponse';
import CreateTableRequest from '../dtos/CreateTableRequest.dto';
import TableResponse from '../dtos/TableResponse.dto';
import TableReservationResponse from '../dtos/TableReservationResponse';

export interface ReservationOrder extends OrderResponse {}

class TableCloudService {
  async getTables(branchId: string): Promise<TableResponse[]> {
    const response = await api.get(`/Table/${branchId}`);
    return response.data;
  }

  async getTableQueue(branchId: string, tableNumber: number): Promise<TableReservationResponse[]> {
    const response = await api.get(`/Table/queue/${branchId}/${tableNumber}`);
    return response.data;
  }

  // Create a new table
  async createTable(table: CreateTableRequest): Promise<TableResponse> {
    const response = await api.post('/Table', table);
    return response.data;
  }

  // Delete a table
  async deleteTable(branchId: string, tableNumber: number): Promise<void> {
    await api.delete(`/Table/${branchId}/${tableNumber}`);
  }

  // Dequeue a table
  async dequeueTable(branchId: string, tableNumber: number): Promise<void> {
    await api.post(`/Table/deque/${branchId}/${tableNumber}`);
  }

  async getReservationOrder(reservationId: string): Promise<ReservationOrder | null> {
    const response = await api.get(`/Table/order/${reservationId}`);

    if (response.status != 200) {
      return null;
    }
    
    return response.data;
  }

  async confirmTableReservation(branchId: string, tableNumber: number): Promise<void> {
    await api.put(`/BranchAttendance/confirm-attendance-via-manager/${branchId}/${tableNumber}`);
  }

  async freezeTable(branchId: string, tableNumber: number): Promise<void> {
    await api.put(`/Table/freeze/${branchId}/${tableNumber}`);
  }

  async unfreezeTable(branchId: string, tableNumber: number): Promise<void> {
    await api.put(`/Table/unfreeze/${branchId}/${tableNumber}`);
  }

  async moveReservation(reservationId: string, toTableNumber: number): Promise<void> {
    await api.put(`/Table/move-reservation/`, {
      reservationId,
      toTableNumber
    });
  }

  async setOrdersAsReady(reservationId: string): Promise<void> {
    await api.put(`/Table/order/set-ready/${reservationId}`);
  }

  async payOrders(reservationId: string): Promise<OrderResponse> {
    const response = await api.put(`/Table/order/pay/${reservationId}`);
    return response.data;
  }

  async pushToKitchen(reservationId: string): Promise<OrderItemResponse[]> {
    const response = await api.put<{orderItems: OrderItemResponse[]}>(`/TableReservation/push-to-kitchen/${reservationId}`);
    return response.data.orderItems;
  }

  async changeReservationPayment(reservationId: string, paymentProvider: string): Promise<void> {
    await api.put(`/UpdateOrder/payment-provider/reservation/${reservationId}`, { paymentProvider });
  }

}

export const tableCloudService = new TableCloudService(); 