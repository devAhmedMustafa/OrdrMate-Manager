import api from '../../../utils/api';

export interface CustomizationChoice {
  value: string;
  label?: string;
  price?: number;
}

// Base metadata interface
export interface BaseCustomizationMetadata {
}

// Single-select metadata
export interface SingleSelectMetadata extends BaseCustomizationMetadata {
  choices: CustomizationChoice[];
}

// Multi-select metadata
export interface MultiSelectMetadata extends BaseCustomizationMetadata {
  choices: CustomizationChoice[];
  minSelections?: number;
  maxSelections?: number;
}

// Text input metadata
export interface TextMetadata extends BaseCustomizationMetadata {
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

// Number input metadata
export interface NumberMetadata extends BaseCustomizationMetadata {
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

// Boolean (checkbox) metadata
export interface BooleanMetadata extends BaseCustomizationMetadata {
  defaultValue?: boolean;
  price?: number;
}

// Union type for all metadata types
export type CustomizationMetadata = 
  | SingleSelectMetadata 
  | MultiSelectMetadata 
  | TextMetadata 
  | NumberMetadata 
  | BooleanMetadata;

export interface CustomizationCategory {
    id?: string;
    name: string;
    restaurantId: string;
    description: string;
    inputType: 'SingleSelect' | 'MultiSelect' | 'Text' | 'Number' | 'Boolean';
    metadata: CustomizationMetadata;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomizationCategoryRequest {
    name: string;
    description: string;
    restaurantId: string;
    metadata: CustomizationMetadata;
}

export interface AssignCategoryToItemRequest {
    itemId: string;
    categoryId: string;
}

export const customizationService = {
  // Get all customization categories
  getCategories: async (restaurantId: string): Promise<CustomizationCategory[]> => {
    const response = await api.get(`/Customization/restaurant/categories/${restaurantId}`);
    return response.data;
  },

  // Create a new single-select customization category
  createSingleSelectCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
    const response = await api.post('/Customization/create-category-single-select', data);
    return response.data;
  },

  // Create a new multi-select customization category
  createMultiSelectCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
    const response = await api.post('/Customization/create-category-multi-select', data);
    return response.data;
  },

  // Create a new text customization category
  createTextCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
    const response = await api.post('/Customization/create-category-text', data);
    return response.data;
  },

  // Create a new number customization category
  createNumberCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
    const response = await api.post('/Customization/create-category-number', data);
    return response.data;
  },

  // Create a new boolean customization category
  createBooleanCategory: async (data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
    const response = await api.post('/Customization/create-category-boolean', data);
    return response.data;
  },

  // Generic method to create any type of category
  createCategory: async (data: CreateCustomizationCategoryRequest, type: string): Promise<CustomizationCategory> => {
    const endpoint = `/Customization/create-category-${type}`;
    const response = await api.post(endpoint, data);
    return response.data;
  },

  // Get a specific customization category by ID
  getCategory: async (id: string): Promise<CustomizationCategory> => {
    const response = await api.get(`/Customization/categories/${id}`);
    return response.data;
  },

  // Update a customization category
  updateCategory: async (id: string, data: CreateCustomizationCategoryRequest): Promise<CustomizationCategory> => {
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
  getItemCustomizations: async (itemId: string): Promise<CustomizationCategory[]> => {
    const response = await api.get(`/Customization/item/${itemId}/customizations`);
    return response.data;
  },

  // Remove a customization category from an item
  removeCategoryFromItem: async (itemId: string, categoryId: string): Promise<void> => {
    await api.delete(`/Customization/item/${itemId}/customization/${categoryId}`);
  },
};
