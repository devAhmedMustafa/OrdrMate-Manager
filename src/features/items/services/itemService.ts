import api from '../../../utils/api';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  priority: number;
  tags: string;
  category: string;
  subCategory?: string;
  brand: string;
}

export interface ItemAvailability {
  itemId: string;
  branchId: string;
  isAvailable: boolean;
  stock: number;
}

export const itemService = {
  // Get all items for a pharmacy
  getPharmacyItems: async (pharmacyId: string): Promise<MenuItem[]> => {
    const response = await api.get(`/Item/pharmacy/${pharmacyId}`);
    return response.data;
  },

  getBranchAvailableItems: async (branchId: string): Promise<MenuItem[]> => {
    const response = await api.get(`/Item/branch/${branchId}`);
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

  // Get item availability data for a branch
  getItemAvailability: async (branchId: string): Promise<ItemAvailability[]> => {
    const response = await api.get(`/ItemAvailability/get-availability-items/${branchId}`);
    return response.data;
  },

  // Toggle item availability
  toggleItemAvailability: async (itemId: string, branchId: string): Promise<void> => {
    await api.put(`/ItemAvailability/toggle`, { branchId, itemId });
  },

  // Update item stock quantity
  updateItemQuantity: async (itemId: string, branchId: string, quantity: number): Promise<void> => {
    await api.put(`/ItemAvailability/update-quantity`, { 
      BranchId: branchId, 
      ItemId: itemId, 
      Quantity: quantity 
    });
  }

}; 