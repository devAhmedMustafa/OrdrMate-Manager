export interface CustomizationChoice {
  value: string;
  label?: string;
  price?: number;
}

export interface BaseCustomizationMetadata {
}

export interface SingleSelectMetadata extends BaseCustomizationMetadata {
  choices: CustomizationChoice[];
}

export type CustomizationMetadata = 
  | SingleSelectMetadata;