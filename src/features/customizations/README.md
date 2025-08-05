# Customization Categories Feature

A comprehensive feature for managing different types of customization categories for menu items in the OrdrMate Manager application.

## Overview

This feature allows restaurant managers to create and manage various types of customization categories that can be applied to menu items. The system supports multiple customization types with flexible metadata structures.

## Supported Customization Types

### 1. Single Select
- **Description**: Radio button selection (customer can choose only one option)
- **Use Cases**: Size, preparation style, sauce selection
- **API Endpoint**: `POST /api/Customization/create-category-single-select`
- **Metadata Fields**:
  - `choices`: Array of available options
  - `required`: Whether selection is mandatory

### 2. Multi Select
- **Description**: Checkbox selection (customer can choose multiple options)
- **Use Cases**: Toppings, add-ons, extras
- **API Endpoint**: `POST /api/Customization/create-category-multi-select`
- **Metadata Fields**:
  - `choices`: Array of available options
  - `minSelections`: Minimum number of selections required
  - `maxSelections`: Maximum number of selections allowed
  - `required`: Whether at least one selection is mandatory

### 3. Text Input
- **Description**: Free text input field
- **Use Cases**: Special instructions, custom text on cake, allergies
- **API Endpoint**: `POST /api/Customization/create-category-text`
- **Metadata Fields**:
  - `placeholder`: Placeholder text for the input
  - `maxLength`: Maximum character limit
  - `required`: Whether input is mandatory

### 4. Number Input
- **Description**: Numeric input with validation
- **Use Cases**: Quantity adjustments, spice level (1-10), cooking time
- **API Endpoint**: `POST /api/Customization/create-category-number`
- **Metadata Fields**:
  - `min`: Minimum allowed value
  - `max`: Maximum allowed value
  - `step`: Step increment for the input
  - `required`: Whether input is mandatory

### 5. Boolean
- **Description**: Simple checkbox (yes/no option)
- **Use Cases**: Extra cheese, make it spicy, include utensils
- **API Endpoint**: `POST /api/Customization/create-category-boolean`
- **Metadata Fields**:
  - `defaultValue`: Default checked state
  - `price`: Additional price if selected

## API Integration
- **Base URL**: `localhost:5126/api/Customization`
- **Get Categories**: `GET /restaurant/categories/{restaurantId}`
- **Create Category**: `POST /create-category-{type}` (where type is single-select, multi-select, text, number, or boolean)
- **Update Category**: `PUT /categories/{id}`
- **Delete Category**: `DELETE /categories/{id}`

## Features
- ✅ Create multiple types of customization categories
- ✅ Type-safe metadata handling
- ✅ Dynamic form fields based on category type
- ✅ Add multiple choices to choice-based categories
- ✅ View all existing categories with type-specific information
- ✅ Delete categories with confirmation
- ✅ Responsive design
- ✅ Comprehensive form validation
- ✅ Error handling and loading states
- ✅ Type guards and utility functions

## Example Request
```json
{
    "name": "size",
    "description": "set a size",
    "metadata": {
        "choices": [
            {"value": "S"},
            {"value": "M"},
            {"value": "L"},
            {"value": "XL"}
        ]
    }
}
```

## File Structure
```
features/customizations/
├── Customizations.page.tsx          # Main page with category list
├── Customizations.module.css        # Main page styles
├── index.ts                         # Export definitions
├── components/
│   ├── AddCategory.tsx              # Create category form
│   └── AddCategory.module.css       # Form styles
└── services/
    └── customizationService.ts      # API service layer
```

## Usage
1. Navigate to `/customizations` in the main dashboard
2. Click "Add Category" to create a new customization
3. Fill in category name, description, and choices
4. View and manage existing categories
5. Delete categories as needed

## Future Enhancements
- Multi-select categories
- Edit existing categories
- Category reordering
- Import/export functionality
