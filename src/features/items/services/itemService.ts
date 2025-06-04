import axios from 'axios';

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
    const response = await axios.get(
      `${BASE_URL}/Item/restaurant/${restaurantId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get a single item by ID
  getItem: async (id: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/Item/${id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Create a new item
  createItem: async (item: Omit<MenuItem, 'id'>, token: string) => {
    const response = await axios.post(
      `${BASE_URL}/Item`,
      item,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Update an existing item
  updateItem: async (id: string, item: MenuItem, token: string) => {
    const response = await axios.put(
      `${BASE_URL}/Item/${id}`,
      item,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Delete an item
  deleteItem: async (id: string, token: string) => {
    await axios.delete(
      `${BASE_URL}/Item/${id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
  },

  // Get all kitchens for a restaurant
  getRestaurantKitchens: async (restaurantId: string, token: string) => {
    const response = await axios.get(
      `${BASE_URL}/Kitchen/${restaurantId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  }
}; 