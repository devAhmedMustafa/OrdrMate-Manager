import { CustomizationMetadata } from "..";

export interface CreateCustomizationCategoryRequest {
    name: string;
    description: string;
    restaurantId: string;
    metadata: CustomizationMetadata;
}