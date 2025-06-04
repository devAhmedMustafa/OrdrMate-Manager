import api from '../../../utils/api';

export interface Branch {
  id: string;
  restaurantId: string;
  lantitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
}

export interface CreateBranchData {
  lantitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
  restaurantId: string;
}

export const branchService = {
  getRestaurantBranches: async (restaurantId: string, token: string): Promise<Branch[]> => {
    const response = await api.get(`/Branch/restaurant/${restaurantId}`);
    return response.data;
  },

  createBranch: async (data: CreateBranchData, token: string): Promise<Branch> => {
    const response = await api.post('/Branch', data);
    return response.data;
  },

  deleteBranch: async (branchId: string, token: string): Promise<void> => {
    await api.delete(`/Branch/${branchId}`);
  }
}; 