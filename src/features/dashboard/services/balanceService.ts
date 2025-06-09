import api from '../../../utils/api';

export interface Balance {
  totalEarnings: number;
  todayEarnings: number;
}

export const balanceService = {
  getBalance: async (branchId: string, token: string): Promise<Balance | null> => {
    try {
      const response = await api.get(`/Branch/balance/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }
}; 