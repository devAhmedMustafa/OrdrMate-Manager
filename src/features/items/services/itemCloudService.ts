import api from '../../../utils/api';
import { ItemDto, Kitchen } from '../dtos/ItemDto';

export const itemCloudService = {

  getRestaurantItems: async (restaurantId: string): Promise<ItemDto[]> => {
    const response = await api.get(`/Item/restaurant/${restaurantId}`);
    return response.data;
  },

  getBranchAvailableItems: async (branchId: string): Promise<ItemDto[]> => {
    const response = await api.get(`/Item/branch/${branchId}`);
    return response.data;
  },

  // Get a single item by ID
  getItem: async (id: string): Promise<ItemDto> => {
    const response = await api.get(`/Item/${id}`);
    return response.data;
  },

  // Create a new item
  createItem: async (item: Omit<ItemDto, 'id'>): Promise<ItemDto> => {
    const response = await api.post('/Item', item);
    return response.data;
  },

  // Update an existing item
  updateItem: async (id: string, item: ItemDto): Promise<ItemDto> => {
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
  },

  toggleItemAvailability: async (itemId: string, branchId: string): Promise<void> => {
    await api.put(`/ItemAvailability/toggle`, { branchId, itemId });
  }

}; 