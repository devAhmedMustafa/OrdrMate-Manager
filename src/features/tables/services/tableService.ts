import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api/Table';

export interface Table {
  tableNumber: number;
  seats: number;
  branchId: string;
}

export const tableService = {
  // Get all tables for a branch
  getBranchTables: async (branchId: string, token: string): Promise<Table[]> => {
    const response = await axios.get(`${BASE_URL}/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Create a new table
  createTable: async (table: Table, token: string): Promise<Table> => {
    const response = await axios.post(BASE_URL, table, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Delete a table
  deleteTable: async (branchId: string, tableNumber: number, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${branchId}/${tableNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}; 