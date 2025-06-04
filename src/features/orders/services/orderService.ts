import axios from 'axios';
import { OrderItem, OrderStatus, UnpaidOrder } from '../types';

const BASE_URL = 'http://localhost:5126/api/Order';

export const orderService = {
  // WebSocket connection
  getWebSocketUrl: (branchId: string) => `ws://localhost:5126/api/Order/live/branch/${branchId}`,

  // Fetch unpaid orders
  getUnpaidOrders: async (branchId: string, token: string): Promise<UnpaidOrder[]> => {
    const response = await axios.get(`${BASE_URL}/unpaid/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Mark order as paid manually
  markAsPaid: async (orderId: string, token: string): Promise<void> => {
    await axios.put(`${BASE_URL}/manual_pay/${orderId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // Mark item as prepared
  markItemAsPrepared: async (
    branchId: string,
    kitchenName: string,
    kitchenUnitId: string,
    token: string
  ): Promise<void> => {
    await axios.post(
      `${BASE_URL}/check-prepared/${branchId}/${kitchenName}/${kitchenUnitId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
}; 