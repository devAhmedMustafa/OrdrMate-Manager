import { CustomizationMetadata } from "../enums/CustomizationMetadata";

export interface CustomizationCategoryResponse {
    id: string;
    name: string;
    restaurantId: string;
    description: string;
    inputType: 'SingleSelect' | 'MultiSelect' | 'Text' | 'Number' | 'Boolean';
    metadata: CustomizationMetadata;
}
