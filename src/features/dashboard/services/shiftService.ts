import api from '../../../utils/api';

export enum ShiftStatus {
  NotStarted = 0,
  Started = 1,
  Ended = 2,
}

export interface ShiftResponse {
  id: string;
  branchId: string;
  shiftStartTime: string;
  shiftEndTime?: string;
  status: ShiftStatus;
}

class ShiftService {
  async startShift(branchId: string): Promise<ShiftResponse> {
    try {
      const response = await api.post('/BranchShift/new/start', { branchId });
      return response.data;
    } catch (error) {
      console.error('Error starting shift:', error);
      throw error;
    }
  }

  async endShift(branchId: string): Promise<ShiftResponse> {
    try {
      const response = await api.post('/BranchShift/end', { branchId });
      return response.data;
    } catch (error) {
      console.error('Error ending shift:', error);
      throw error;
    }
  }

  async getShiftStatus(branchId: string): Promise<ShiftResponse> {
    try {
      const response = await api.get<ShiftResponse>(`/BranchShift/status/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift status:', error);
      throw error;
    }
  }

  async getBranchShifts(branchId: string): Promise<ShiftResponse[]> {
    try {
      const response = await api.get<ShiftResponse[]>(`/BranchShift/list/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch shifts:', error);
      throw error;
    }
  }
}


export const shiftService = new ShiftService();