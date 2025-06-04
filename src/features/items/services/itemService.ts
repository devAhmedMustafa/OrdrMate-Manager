import api from '../../../utils/api';

const BASE_URL = 'http://localhost:5126/api';

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
  getRestaurantItems: async (restaurantId: string, token: string) => {
    const response = await api.get(`/Item/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get a single item by ID
  getItem: async (id: string, token: string) => {
    const response = await api.get(`/Item/${id}`);
    return response.data;
  },

  // Create a new item
  createItem: async (item: Omit<MenuItem, 'id'>, token: string) => {
    const response = await api.post('/Item', item);
    return response.data;
  },

  // Update an existing item
  updateItem: async (id: string, item: MenuItem, token: string) => {
    const response = await api.put(`/Item/${id}`, item);
    return response.data;
  },

  // Delete an item
  deleteItem: async (id: string, token: string) => {
    await api.delete(`/Item/${id}`);
  },

  // Get all kitchens for a restaurant
  getRestaurantKitchens: async (restaurantId: string, token: string) => {
    const response = await api.get(`/Kitchen/${restaurantId}`);
    return response.data;
  }
}; 