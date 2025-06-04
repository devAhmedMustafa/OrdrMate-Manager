import axios from 'axios';

const BASE_URL = 'http://localhost:5126/api/Restaurant';

export interface Restaurant {
  id: string;
  name: string;
}

export const restaurantService = {
  getRestaurant: async (restaurantId: string, token: string): Promise<Restaurant> => {
    const response = await axios.get(`${BASE_URL}/${restaurantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
}; 