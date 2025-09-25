# Table Number Feature

## Overview
The table number feature ensures that every dine-in order is associated with a specific table number before being placed. This helps restaurant staff deliver orders to the correct table and track order locations.

## Features

### Required Field
- Table number input is **required** before placing any order
- Orders cannot be placed without a valid table number (1-999)
- Clear validation messages inform users when table number is missing

### User Interface
- **Table Number Input**: Located in the cart summary at the bottom of the screen
- **Visual Indicators**: Warning message displays when table number is missing
- **Input Validation**: Only accepts numbers between 1-999
- **Focus States**: Input highlights with purple border when focused

### User Experience
- **Persistent Storage**: Table number is saved to localStorage and restored between sessions
- **Auto-clear**: Table number resets after successful order placement
- **Keyboard Shortcut**: Press `Ctrl+T` (or `Cmd+T` on Mac) to quickly focus the table input
- **Responsive Design**: Adapts to mobile and desktop screens

### Validation Rules
1. Table number must be provided before placing order
2. Must be a positive integer between 1 and 999
3. Cannot be empty or zero
4. Cart cannot be empty when placing order

### Error Handling
- **Missing Table Number**: "Please enter a table number"
- **Empty Cart**: "Cannot place order with empty cart"
- **Network Errors**: "Failed to place order"

## Implementation Details

### Components Modified
- `BranchMenu.page.tsx`: Added table number UI and validation
- `VirtualCart.tsx`: Added table number state management and validation
- `Menu.module.css`: Added responsive styling for cart components

### Data Flow
1. User enters table number → stored in context state
2. Table number persisted to localStorage
3. Validation runs before order placement
4. Table number included in order payload
5. Success → table number cleared, cart emptied

### API Integration
- Table number sent as `tableNumber` field in `PlaceOrderRequestDto`
- Integrated with existing order service endpoint
- Order type remains as dine-in (type: 1)

## Usage Example
```typescript
// User adds items to cart
addItem(new CartItem({...}));

// User enters table number
setTableNumber(15);

// Order placement with validation
await placeOrder(); // Includes tableNumber: 15
```

## Testing Checklist
- [ ] Table number input appears when cart has items
- [ ] Validation prevents order placement without table number
- [ ] Table number persists between page refreshes
- [ ] Keyboard shortcut (Ctrl+T) focuses input
- [ ] Mobile responsive design works correctly
- [ ] Success flow clears table number and cart
- [ ] Error messages display appropriately