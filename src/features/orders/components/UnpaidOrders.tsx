import { UnpaidOrder } from '../types';
import styles from './UnpaidOrders.module.css';
import { useState } from 'react';

interface UnpaidOrdersProps {
  orders: UnpaidOrder[];
  onMarkAsPaid: (orderId: string) => void;
}

export function UnpaidOrders({ orders, onMarkAsPaid }: UnpaidOrdersProps) {
  const [search, setSearch] = useState('');

  // Helper function to get the best available order identifier
  const getOrderDisplayNumber = (order: UnpaidOrder) => {
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

  const filteredOrders = orders.filter(order => {
    // Safely convert all searchable fields to strings
    const orderNumberStr = order.orderNumber?.toString().toLowerCase() || '';
    const tableNumberStr = order.tableNumber?.toString() || '';
    const customerStr = order.customer?.toLowerCase() || '';
    const displayNumber = getOrderDisplayNumber(order).toLowerCase();
    const orderTypeStr = order.orderType?.toLowerCase() || '';
    const searchLower = search.toLowerCase();
    
    return orderNumberStr.includes(searchLower) || 
           tableNumberStr.includes(searchLower) ||
           customerStr.includes(searchLower) ||
           displayNumber.includes(searchLower) ||
           orderTypeStr.includes(searchLower);
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
          placeholder="Search by Order Number, Table, Customer, or Type"
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
                </div>
                <div className={styles.amount}>
                  ${(order.totalAmount || 0).toFixed(2)}
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
              </div>

              <button 
                className={styles.payButton}
                onClick={() => onMarkAsPaid(order.orderId)}
              >
                Mark as Paid
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 