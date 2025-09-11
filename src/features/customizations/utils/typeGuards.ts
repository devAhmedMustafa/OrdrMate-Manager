import { 
  // CustomizationMetadata, 
  // SingleSelectMetadata, 
  // MultiSelectMetadata, 
  // TextMetadata, 
  // NumberMetadata, 
  // BooleanMetadata, 
  CustomizationCategory
} from '../services/customizationService';

// Type guard functions for runtime type checking
export function isSingleSelectMetadata(category: CustomizationCategory) {
  return category.inputType === 'SingleSelect';
}

export function isMultiSelectMetadata(category: CustomizationCategory) {
  return category.inputType === 'MultiSelect';
}

export function isTextMetadata(category: CustomizationCategory) {
  return category.inputType === 'Text';
}

export function isNumberMetadata(category: CustomizationCategory) {
  return category.inputType === 'Number';
}

export function isBooleanMetadata(category: CustomizationCategory) {
  return category.inputType === 'Boolean';
}

export function hasChoices(category: CustomizationCategory) {
  return isSingleSelectMetadata(category) || isMultiSelectMetadata(category);
}

export function getCategoryTypeDisplayName(category: CustomizationCategory): string {
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
export function getCategoryTypeIcon(category: CustomizationCategory): string {
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
