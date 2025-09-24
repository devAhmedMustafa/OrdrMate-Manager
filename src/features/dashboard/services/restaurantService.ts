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
  getRestaurant: async (restaurantId: string): Promise<Restaurant> => {
    const response = await api.get(`/Pharmacy/${restaurantId}`);
    return response.data;
  },

  getProfile: async (restaurantId: string): Promise<RestaurantProfile> => {
    const response = await api.get(`/Pharmacy/profile/${restaurantId}`);
    return response.data;
  },

  updateProfile: async (restaurantId: string, profile: RestaurantProfile): Promise<void> => {
    await api.put(`/Pharmacy/profile/${restaurantId}`, profile);
  }
}; 