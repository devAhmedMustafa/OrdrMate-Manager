import api from '../../../utils/api';
import { MenuItem } from '../../items/services/itemService';

export interface Table {
  tableNumber: number;
  seats: number;
  branchId: string;
}

export enum OrderStatus {
  Queued = 'Queued',
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

export interface ReservationOrder {
  orderId: string;
  orderStatus: OrderStatus;
  orderItems: { item: MenuItem, quantity: number }[];
}

class TableService {
  async getTables(branchId: string): Promise<Table[]> {
    const response = await api.get(`/Table/${branchId}`);
    return response.data;
  }

  async getTableQueue(branchId: string, tableNumber: number): Promise<TableReservation[]> {
    const response = await api.get(`/Table/queue/${branchId}/${tableNumber}`);
    return response.data;
  }

  // Create a new table
  async createTable(table: Table): Promise<Table> {
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

  async getReservationOrder(reservationId: string): Promise<ReservationOrder> {
    const response = await api.get(`/Table/order/${reservationId}`);
    return response.data;
  }

}

export const tableService = new TableService(); 