import { 
  // CustomizationMetadata, 
  // SingleSelectMetadata, 
  // MultiSelectMetadata, 
  // TextMetadata, 
  // NumberMetadata, 
  // BooleanMetadata, 
  CustomizationCategoryResponse
} from '../services/customizationCloudService';

// Type guard functions for runtime type checking
export function isSingleSelectMetadata(category: CustomizationCategoryResponse) {
  return category.inputType === 'SingleSelect';
}

export function isMultiSelectMetadata(category: CustomizationCategoryResponse) {
  return category.inputType === 'MultiSelect';
}

export function isTextMetadata(category: CustomizationCategoryResponse) {
  return category.inputType === 'Text';
}

export function isNumberMetadata(category: CustomizationCategoryResponse) {
  return category.inputType === 'Number';
}

export function isBooleanMetadata(category: CustomizationCategoryResponse) {
  return category.inputType === 'Boolean';
}

export function hasChoices(category: CustomizationCategoryResponse) {
  return isSingleSelectMetadata(category) || isMultiSelectMetadata(category);
}

export function getCategoryTypeDisplayName(category: CustomizationCategoryResponse): string {
  switch (category.inputType) {
    case 'SingleSelect':
      return 'Single Select';
    case 'MultiSelect':
      return 'Multi Select';
    case 'Text':
      return 'Text Input';
    case 'Number':
      return 'Number Input';
    case 'Boolean':
      return 'Boolean';
    default:
      return 'Unknown';
  }
}

// Helper function to get icon for category type
export function getCategoryTypeIcon(category: CustomizationCategoryResponse): string {
  switch (category.inputType) {
    case 'SingleSelect':
      return 'mdi:radiobox-marked';
    case 'MultiSelect':
      return 'mdi:checkbox-marked';
    case 'Text':
      return 'mdi:text-box';
    case 'Number':
      return 'mdi:numeric';
    case 'Boolean':
      return 'mdi:toggle-switch';
    default:
      return 'mdi:help-circle';
  }
}
