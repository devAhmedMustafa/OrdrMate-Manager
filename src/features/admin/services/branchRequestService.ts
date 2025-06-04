import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api/Branch';

export interface BranchRequest {
  branchRequestId: string;
  lantitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
  restaurantName: string;
}

export interface BranchCredentials {
  username: string;
  password: string;
}

export const branchRequestService = {
  getBranchRequests: async (token: string): Promise<BranchRequest[]> => {
    const response = await axios.get(BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  approveBranchRequest: async (requestId: string, token: string): Promise<BranchCredentials> => {
    const response = await axios.post(
      `${BASE_URL}/${requestId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return {
      username: response.data.branchManagerUsername,
      password: response.data.branchManagerPassword
    };
  }
}; 