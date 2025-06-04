import api from '../../../utils/api';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  preparationTime: number;
  category: string;
  kitchenId: string;
}

export interface Kitchen {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
}

export const itemService = {
  // Get all items for a restaurant
  getRestaurantItems: async (restaurantId: string): Promise<MenuItem[]> => {
    const response = await api.get(`/Item/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get a single item by ID
  getItem: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/Item/${id}`);
    return response.data;
  },

  // Create a new item
  createItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const response = await api.post('/Item', item);
    return response.data;
  },

  // Update an existing item
  updateItem: async (id: string, item: MenuItem): Promise<MenuItem> => {
    const response = await api.put(`/Item/${id}`, item);
    return response.data;
  },

  // Delete an item
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/Item/${id}`);
  },

  // Get all kitchens for a restaurant
  getRestaurantKitchens: async (restaurantId: string): Promise<Kitchen[]> => {
    const response = await api.get(`/Kitchen/${restaurantId}`);
    return response.data;
  }
}; 