import api from '../../../utils/api';

export interface Kitchen {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
}

export const kitchenService = {
  // Get all kitchens for a restaurant
  getRestaurantKitchens: async (restaurantId: string): Promise<Kitchen[]> => {
    const response = await api.get(`/Kitchen/${restaurantId}`);
    return response.data;
  },

  // Create a new kitchen
  createKitchen: async (kitchen: Omit<Kitchen, 'id'>): Promise<Kitchen> => {
    const response = await api.post('/Kitchen', kitchen);
    return response.data;
  },

  // Delete a kitchen
  deleteKitchen: async (kitchenId: string): Promise<void> => {
    await api.delete(`/Kitchen/${kitchenId}`);
  }
}; 