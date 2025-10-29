import api from '../../../utils/api';
import { AssignCategoryToItemRequest } from '../dtos/AssignCategoryToItemRequest';
import { CreateCustomizationCategoryRequest } from '../dtos/CreateCustomizationCategoryRequest';
import { CustomizationCategoryResponse } from '../dtos/CustomizationCategoryResponse';
import OrderCustomizationResponse from '../dtos/OrderCustomizationResponse.dto';

export const customizationService = {
  // Get all customization categories
  getCategories: async (restaurantId: string): Promise<CustomizationCategoryResponse[]> => {
    const response = await api.get(`/Customization/restaurant/categories/${restaurantId}`);
    return response.data;
  },

  // Create a new single-select customization category
  createSingleSelectCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategoryResponse> => {
    const response = await api.post('/Customization/create-category-single-select', data);
    return response.data;
  },

  // Generic method to create any type of category
  createCategory: async (data: CreateCustomizationCategoryRequest, type: string): Promise<CustomizationCategoryResponse> => {
    const endpoint = `/Customization/create-category-${type}`;
    const response = await api.post(endpoint, data);
    return response.data;
  },

  // Get a specific customization category by ID
  getCategory: async (id: string): Promise<CustomizationCategoryResponse> => {
    const response = await api.get(`/Customization/categories/${id}`);
    return response.data;
  },

  // Update a customization category
  updateCategory: async (id: string, data: CreateCustomizationCategoryRequest): Promise<CustomizationCategoryResponse> => {
    const response = await api.put(`/Customization/categories/${id}`, data);
    return response.data;
  },

  // Delete a customization category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/Customization/categories/${id}`);
  },

  // Assign a customization category to an item
  assignCategoryToItem: async (data: AssignCategoryToItemRequest): Promise<void> => {
    await api.post('/Customization/assign-category-to-item', data);
  },

  // Get customization categories assigned to an item
  getItemCustomizations: async (itemId: string): Promise<CustomizationCategoryResponse[]> => {
    const response = await api.get(`/Customization/item/${itemId}/customizations`);
    return response.data;
  },

  // Remove a customization category from an item
  removeCategoryFromItem: async (itemId: string, categoryId: string): Promise<void> => {
    await api.delete(`/Customization/item/${itemId}/customization/${categoryId}`);
  },

  getOrderCustomizations: async (orderId: string): Promise<OrderCustomizationResponse> => {
    const response = await api.get(`/UserCustomization/order/${orderId}`);
    return response.data;
  },

  getOrderCustomizationByReservation: async (reservationId: string): Promise<OrderCustomizationResponse> => {
    const response = await api.get(`/UserCustomization/reservation/${reservationId}`);
    return response.data;
  }
};
