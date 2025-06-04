import api from '../../../utils/api';

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
  getBranchRequests: async (): Promise<BranchRequest[]> => {
    const response = await api.get('/Branch');
    return response.data;
  },

  approveBranchRequest: async (requestId: string): Promise<BranchCredentials> => {
    const response = await api.post(`/Branch/${requestId}`);
    return {
      username: response.data.branchManagerUsername,
      password: response.data.branchManagerPassword
    };
  }
}; 