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
  getRestaurantBranches: async (restaurantId: string): Promise<Branch[]> => {
    const response = await api.get(`/Branch/Pharmacy/${restaurantId}`);
    return response.data;
  },

  createBranch: async (data: CreateBranchData): Promise<Branch> => {
    const response = await api.post('/Branch/request/create', data);
    return response.data;
  },
}; 