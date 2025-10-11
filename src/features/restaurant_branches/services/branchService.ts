import api from '../../../utils/api';

export interface Branch {
  id: string;
  pharmacyId: string;
  latitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
}

export interface CreateBranchData {
  latitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
  pharmacyId: string;
}

export const branchService = {

  createBranch: async (data: CreateBranchData): Promise<Branch> => {
    const response = await api.post('/Branch/request/create', data);
    return response.data;
  },
}; 