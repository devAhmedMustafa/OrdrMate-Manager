import api from '../../../utils/api';
import Order from '../../orders/models/Order';
import OrderItem from '../../orders/models/OrderItem';
import CreateTableRequest from '../dtos/CreateTableRequest.dto';
import TableResponse from '../dtos/TableResponse.dto';

export enum OrderStatus {
  Pending = 'Pending',
  Queued = 'Queued',
  InProgress = 'InProgress',
  Ready = 'Ready',
  Delivered = 'Delivered'
}

export interface TableReservation {
  reservationId: string;
  tableNumber: number;
  customerName: string;
  reservationDate: string;
  reservationStatus: string;
  orderId: string;
  orderStatus: OrderStatus;
}

export interface ReservationOrder extends Order {}

class TableService {
  async getTables(branchId: string): Promise<TableResponse[]> {
    const response = await api.get(`/Table/${branchId}`);
    return response.data;
  }

  async getTableQueue(branchId: string, tableNumber: number): Promise<TableReservation[]> {
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

  async payOrders(reservationId: string): Promise<Order> {
    const response = await api.put(`/Table/order/pay/${reservationId}`);
    return response.data;
  }

  async pushToKitchen(reservationId: string): Promise<OrderItem[]> {
    const response = await api.put<{orderItems: OrderItem[]}>(`/TableReservation/push-to-kitchen/${reservationId}`);
    return response.data.orderItems;
  }

}

export const tableService = new TableService(); 