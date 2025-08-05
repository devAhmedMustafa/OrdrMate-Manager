export { default as CustomizationsPage } from './Customizations.page';
export { default as AddCategory } from './components/AddCategory';
export { customizationService } from './services/customizationService';
export type { 
  CustomizationCategory, 
  CustomizationChoice, 
  CustomizationMetadata,
  CreateCustomizationCategoryRequest,
  AssignCategoryToItemRequest,
  SingleSelectMetadata,
  MultiSelectMetadata,
  TextMetadata,
  NumberMetadata,
  BooleanMetadata
} from './services/customizationService';

export {
  isSingleSelectMetadata,
  isMultiSelectMetadata,
  isTextMetadata,
  isNumberMetadata,
  isBooleanMetadata,
  hasChoices,
  getCategoryTypeDisplayName,
  getCategoryTypeIcon
} from './utils/typeGuards';
