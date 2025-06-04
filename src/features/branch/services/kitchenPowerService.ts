import api from '../../../utils/api';

export enum KitchenPowerStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  MAINTENANCE = 2
}

export interface Kitchen {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
}

export interface KitchenPower {
  kitchenId: string;
  kitchenName: string;
  branchId: string;
  units: number;
  status: KitchenPowerStatus;
}

export interface UpdateKitchenPowerData {
  units: number;
  status: KitchenPowerStatus;
}

export const kitchenPowerService = {
  getRestaurantKitchens: async (restaurantId: string, token: string): Promise<Kitchen[]> => {
    const response = await api.get(`/Kitchen/${restaurantId}`);
    return response.data;
  },

  getKitchenPower: async (branchId: string, kitchenId: string, token: string): Promise<KitchenPower | null> => {
    try {
      const response = await api.get(`/Kitchen/power/${branchId}/${kitchenId}`);
      return {
        ...response.data,
        status: parseInt(response.data.status)
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  updateKitchenPower: async (
    branchId: string,
    kitchenId: string,
    data: UpdateKitchenPowerData,
    token: string
  ): Promise<KitchenPower> => {
    const response = await api.put(`/Kitchen/power/${branchId}/${kitchenId}`, data);
    return {
      ...response.data,
      status: parseInt(response.data.status)
    };
  }
}; 