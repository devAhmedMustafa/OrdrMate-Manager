import api from '../../../utils/api';

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
  tableNumber: number;
  customerName: string;
  reservationDate: string;
  reservationStatus: string;
  orderId: string;
  orderStatus: OrderStatus;
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
}

export const tableService = new TableService(); 