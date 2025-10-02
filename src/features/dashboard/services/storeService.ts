import api from '../../../utils/api';

export interface Restaurant {
  id: string;
  name: string;
}

export interface RestaurantProfile {
  description: string;
  logoUrl: string;
  coverImageUrl: string;
}

export const restaurantService = {
  getRestaurant: async (storeId: string): Promise<Restaurant> => {
    const response = await api.get(`/Store/${storeId}`);
    return response.data;
  },

  getProfile: async (storeId: string): Promise<RestaurantProfile> => {
    const response = await api.get(`/Store/profile/${storeId}`);
    return response.data;
  },

  updateProfile: async (storeId: string, profile: RestaurantProfile): Promise<void> => {
    await api.put(`/Store/profile/${storeId}`, profile);
  }
}; 