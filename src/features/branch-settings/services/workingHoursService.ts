import api from '../../../utils/api';

export interface WorkingHours {
  startWorkingHour: string; // Format: "HH:mm:ss"
  endWorkingHour: string;   // Format: "HH:mm:ss"
  workingDays: boolean[];   // Array of 7 booleans [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export const workingHoursService = {
  // Get working hours for a branch
  getWorkingHours: async (branchId: string): Promise<WorkingHours> => {
    const response = await api.get(`/Branch/working-hours/${branchId}`);
    return response.data;
  },

  // Update working hours for a branch
  updateWorkingHours: async (branchId: string, workingHours: WorkingHours): Promise<void> => {
    await api.put(`/Branch/working-hours/${branchId}`, workingHours);
  },
};
