import OrderResponse from '../dtos/OrderResponse';
import styles from './UnpaidOrders.module.css';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { orderService } from '../services/orderService';

interface UnpaidOrdersProps {
  orders: OrderResponse[];
  onMarkAsPaid: (orderId: string, paymentProvider?: string) => void;
  onOrderUpdate?: () => void; // Callback to refresh orders after payment provider change
}

// Payment provider options
const PAYMENT_PROVIDERS = [
  { id: 'cash', name: 'Cash', icon: 'mdi:cash', color: '#4CAF50' },
  { id: 'instapay', name: 'InstaPay', icon: 'mdi:credit-card-fast', color: '#2196F3' }
];

export function UnpaidOrders({ orders, onMarkAsPaid, onOrderUpdate }: UnpaidOrdersProps) {
  const [search, setSearch] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<{ [orderId: string]: string }>({});
  const [isUpdatingPaymentProvider, setIsUpdatingPaymentProvider] = useState<{ [orderId: string]: boolean }>({});

  // Helper function to get the best available order identifier
  const getOrderDisplayNumber = (order: OrderResponse) => {
    // Priority order: orderNumber -> tableNumber -> shortened orderId
    
    // 1. First try to use the actual order number
    if (order.orderNumber && order.orderNumber !== null) {
      return order.orderNumber.toString();
    }
    
    // 2. If no order number, try table number for dine-in orders
    if (order.tableNumber && order.tableNumber > 0) {
      return `Table ${order.tableNumber}`;
    }
    
    // 3. Last resort: use a shortened version of orderId
    if (order.orderId) {
      // Take last 6 characters of orderId to make it more readable
      const shortId = order.orderId.slice(-6).toUpperCase();
      return shortId;
    }
    
    return 'N/A';
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handlePaymentProviderChange = async (orderId: string, providerId: string) => {
    // Update local state immediately for UI responsiveness
    setSelectedPaymentProvider(prev => ({
      ...prev,
      [orderId]: providerId
    }));

    // Set loading state
    setIsUpdatingPaymentProvider(prev => ({
      ...prev,
      [orderId]: true
    }));

    try {
      // Call the orderService to update payment provider
      await orderService.changeOrderPaymentProvider(orderId, providerId);
      
      // Trigger order refresh if callback is provided
      if (onOrderUpdate) {
        onOrderUpdate();
      }

      console.log(`Payment provider updated to ${providerId} for order ${orderId}`);
    } catch (error) {
      console.error('Failed to update payment provider:', error);
      
      // Revert local state on error
      setSelectedPaymentProvider(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });

      // Show error message (you might want to use a toast/notification system)
      alert('Failed to update payment provider. Please try again.');
    } finally {
      // Clear loading state
      setIsUpdatingPaymentProvider(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };

  const getSelectedProvider = (order: OrderResponse) => {
    // Priority: local state -> order data -> default to cash
    const providerId = selectedPaymentProvider[order.orderId] || order.paymentProvider || 'cash';
    return PAYMENT_PROVIDERS.find(p => p.id === providerId) || PAYMENT_PROVIDERS[0];
  };

  const handleMarkAsPaid = (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    const provider = getSelectedProvider(order!).id;
    onMarkAsPaid(orderId, provider);
  };

  const filteredOrders = orders.filter(order => {
    // Safely convert all searchable fields to strings
    const orderNumberStr = order.orderNumber?.toString().toLowerCase() || '';
    const tableNumberStr = order.tableNumber?.toString() || '';
    const customerStr = order.customer?.toLowerCase() || '';
    const displayNumber = getOrderDisplayNumber(order).toLowerCase();
    const orderTypeStr = order.orderType?.toLowerCase() || '';
    const searchLower = search.toLowerCase();
    
    // Also search in order items
    const itemsMatch = order.orderItems?.some(item => 
      item.item.name.toLowerCase().includes(searchLower) ||
      item.item.category?.toLowerCase().includes(searchLower)
    ) || false;
    
    return orderNumberStr.includes(searchLower) || 
           tableNumberStr.includes(searchLower) ||
           customerStr.includes(searchLower) ||
           displayNumber.includes(searchLower) ||
           orderTypeStr.includes(searchLower) ||
           itemsMatch;
  });

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        No unpaid orders found
      </div>
    );
  }

  return (
    <div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Order Number, Table, Customer, Type, or Items"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.ordersCount}>
          {filteredOrders.length} of {orders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Orders Found</h3>
          <p>
            {search 
              ? `No orders match "${search}". Try a different search term.`
              : 'No unpaid orders found.'
            }
          </p>
        </div>
      ) : (
        <div className={styles.container}>
          {filteredOrders.map(order => (
            <div key={order.orderId} className={styles.orderCard}>
              <div className={styles.header}>
                <div className={styles.orderInfo}>
                  <h3>Order #{getOrderDisplayNumber(order)}</h3>
                  <span className={styles.orderType}>{order.orderType || 'Unknown'}</span>
                  {order.orderItems && order.orderItems.length > 0 && (
                    <span className={styles.itemsCount}>
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className={styles.headerActions}>
                  <div className={styles.amount}>
                    ${(order.totalAmount || 0).toFixed(2)}
                  </div>
                  {order.orderItems && order.orderItems.length > 0 && (
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleOrderExpansion(order.orderId)}
                      title={expandedOrders.has(order.orderId) ? 'Hide items' : 'Show items'}
                    >
                      <Icon 
                        icon={expandedOrders.has(order.orderId) ? 'mdi:chevron-up' : 'mdi:chevron-down'} 
                        style={{ fontSize: '18px' }}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Customer:</span>
                  <span className={styles.customerName}>{order.customer || 'N/A'}</span>
                </div>
                {order.tableNumber && order.tableNumber > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Table:</span>
                    <span className={styles.tableNumber}>Table {order.tableNumber}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.label}>Order Type:</span>
                  <span className={styles.orderType}>{order.orderType || 'Unknown'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Amount:</span>
                  <span className={styles.amount}>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Status:</span>
                  <span className={styles.status}>{order.orderStatus || 'N/A'}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.date}>{new Date(order.orderDate || '').toLocaleString()}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Payment:</span>
                  <span className={styles.paymentProvider}>
                    {getSelectedProvider(order).name}
                  </span>
                </div>
              </div>

              {/* Order Items Section */}
              {order.orderItems && order.orderItems.length > 0 && expandedOrders.has(order.orderId) && (
                <div className={styles.orderItems}>
                  <div className={styles.itemsHeader}>
                    <Icon icon="mdi:food" style={{ fontSize: '16px' }} />
                    <span>Order Items</span>
                  </div>
                  <div className={styles.itemsList}>
                    {order.orderItems.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.itemMain}>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.item.name}</span>
                            {item.item.category && (
                              <span className={styles.itemCategory}>{item.item.category}</span>
                            )}
                          </div>
                          <div className={styles.itemPricing}>
                            <span className={styles.itemQuantity}>×{item.quantity}</span>
                            <span className={styles.itemPrice}>${item.item.price.toFixed(2)}</span>
                            <span className={styles.itemTotal}>
                              ${(item.item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Items Summary */}
                  <div className={styles.itemsSummary}>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Total Items:</span>
                      <span className={styles.summaryValue}>
                        {order.orderItems.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Subtotal:</span>
                      <span className={styles.summaryValue}>
                        ${order.orderItems.reduce((total, item) => total + (item.item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Provider Selection */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentHeader}>
                  <Icon icon="mdi:credit-card-outline" style={{ fontSize: '16px' }} />
                  <span>Payment Method</span>
                  {isUpdatingPaymentProvider[order.orderId] && (
                    <Icon 
                      icon="mdi:loading" 
                      style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }} 
                    />
                  )}
                </div>
                
                <div className={styles.paymentSelector}>
                  <select
                    className={styles.paymentSelect}
                    value={getSelectedProvider(order).id}
                    onChange={(e) => handlePaymentProviderChange(order.orderId, e.target.value)}
                    disabled={isUpdatingPaymentProvider[order.orderId]}
                  >
                    {PAYMENT_PROVIDERS.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.selectedProviderIcon}>
                    <Icon 
                      icon={getSelectedProvider(order).icon} 
                      style={{ 
                        fontSize: '20px', 
                        color: getSelectedProvider(order).color 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button 
                className={styles.payButton}
                onClick={() => handleMarkAsPaid(order.orderId)}
                style={{ backgroundColor: getSelectedProvider(order).color }}
              >
                <Icon 
                  icon={getSelectedProvider(order).icon} 
                  style={{ fontSize: '16px', marginRight: '8px' }} 
                />
                Mark as Paid - {getSelectedProvider(order).name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}