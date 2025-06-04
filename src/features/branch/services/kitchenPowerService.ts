import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api/Kitchen';

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
    const response = await axios.get(`${BASE_URL}/${restaurantId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  getKitchenPower: async (branchId: string, kitchenId: string, token: string): Promise<KitchenPower | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/power/${branchId}/${kitchenId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return {
        ...response.data,
        status: parseInt(response.data.status)
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
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
    const response = await axios.put(
      `${BASE_URL}/power/${branchId}/${kitchenId}`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      ...response.data,
      status: parseInt(response.data.status)
    };
  }
}; 