# Order Filtering System

## Overview
The order filtering system allows users to filter orders by multiple criteria including date range, status, order type, and payment status.

## Features

### Filter Options
- **Date Range**: Filter orders by start and end date
- **Status**: Filter by order status (Pending, Ready, etc.)
- **Order Type**: Filter by order type (Dine-in, Takeaway, etc.)
- **Payment Status**: Filter by paid/unpaid status

### User Interface
- **Filter Toggle**: Show/hide filter panel
- **Filter Summary**: Shows active filters and result count
- **Quick Remove**: Remove individual filters with × button
- **Reset All**: Clear all filters at once

### Keyboard Shortcuts
- `Ctrl+F` (or `Cmd+F` on Mac): Toggle filter panel
- `Ctrl+R` (or `Cmd+R` on Mac): Reset all filters

### Persistence
- Filter preferences are automatically saved to localStorage
- Filters persist between browser sessions

### Filter Logic
- **Date Filtering**: Inclusive range, handles various date formats
- **Status/Type Filtering**: Case-insensitive matching
- **Payment Filtering**: Handles undefined/null values as unpaid
- **Combined Filters**: All active filters are applied together (AND logic)

## Implementation Details

### Components
- Main filtering logic in `Orders.page.tsx`
- Styles in `Orders.module.css`
- Filter state managed with React hooks

### Data Flow
1. User modifies filters → `handleFilterChange`
2. Filters saved to localStorage
3. `filteredOrders` recomputed via `useMemo`
4. UI updates with filtered results

### Error Handling
- Graceful handling of invalid dates
- Safe localStorage access with try/catch
- Fallback for missing order data

## Usage Example
```typescript
// Filter orders from last 7 days that are paid
const filters = {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-08',
  status: '',
  orderType: '',
  isPaid: 'paid'
};
```