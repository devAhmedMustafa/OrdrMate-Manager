import api from '../../../utils/api';

export interface Table {
  tableNumber: number;
  seats: number;
  branchId: string;
}

export const tableService = {
  // Get all tables for a branch
  getBranchTables: async (branchId: string, token: string): Promise<Table[]> => {
    const response = await api.get(`/Table/${branchId}`);
    return response.data;
  },

  // Create a new table
  createTable: async (table: Table, token: string): Promise<Table> => {
    const response = await api.post('/Table', table);
    return response.data;
  },

  // Delete a table
  deleteTable: async (branchId: string, tableNumber: number, token: string): Promise<void> => {
    await api.delete(`/Table/${branchId}/${tableNumber}`);
  }
}; 