import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api/Branch';

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
    const response = await axios.get(`${BASE_URL}/restaurant/${restaurantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  createBranch: async (data: CreateBranchData, token: string): Promise<Branch> => {
    const response = await axios.post(BASE_URL, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  deleteBranch: async (branchId: string, token: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}; 