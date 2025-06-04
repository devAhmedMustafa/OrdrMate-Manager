import api from '../../../utils/api';

export interface Restaurant {
  id: string;
  name: string;
}

export const restaurantService = {
  getRestaurant: async (restaurantId: string, token: string): Promise<Restaurant> => {
    const response = await api.get(`/Restaurant/${restaurantId}`);
    return response.data;
  }
}; 