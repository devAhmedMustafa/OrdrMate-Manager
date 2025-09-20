import React from 'react';
import styles from './TakeawayOrders.module.css';

interface TakeawayOrder {
  orderId: string;
  customer: string;
  customerId: string;
  totalAmount: number;
  orderDate: string;
  orderStatus?: string;
  branchId: string;
  isPaid: boolean;
  paymentMethod: string;
  orderNumber: string;
}

interface TakeawayOrdersProps {
  orders: TakeawayOrder[];
  search: string;
  onSearch: (value: string) => void;
  onRequestPickup: (orderId: string) => void;
  onMarkAsPaid: (orderId: string) => void;
  isLoading?: boolean;
}

const TakeawayOrders: React.FC<TakeawayOrdersProps> = ({ orders, search, onSearch, onRequestPickup, onMarkAsPaid, isLoading = false }) => {
  const getOrderDisplayNumber = (order: TakeawayOrder) => {
    if (order.orderNumber !== null) {
      return order.orderNumber.toString();
    }

    if (order.orderId) {
      const shortId = order.orderId.slice(-6).toUpperCase();
      return shortId;
    }

    return 'N/A';
  };

  const filteredAndSortedOrders = orders
    .filter((order: TakeawayOrder) => {
      if (!search.trim()) return true;
      
      const searchTerm = search.toLowerCase().trim();
      const orderNumber = order.orderNumber?.toString().toLowerCase() || '';
      const displayNumber = getOrderDisplayNumber(order).toLowerCase();
      
      return orderNumber.includes(searchTerm) || displayNumber.includes(searchTerm);
    })
    .sort((a: TakeawayOrder, b: TakeawayOrder) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Order Number"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className={styles.searchInput}
          disabled={isLoading}
        />
        <div className={styles.ordersCount}>
          {isLoading ? 'Loading...' : `${filteredAndSortedOrders.length} order${filteredAndSortedOrders.length !== 1 ? 's' : ''} found`}
        </div>
      </div>
      
      {isLoading ? (
        <div className={styles.emptyState}>
          <h3>Loading Takeaway Orders...</h3>
          <p>Please wait while we fetch the latest orders.</p>
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Takeaway Orders Found</h3>
          <p>
            {search 
              ? `No orders match "${search}". Try a different search term.`
              : 'There are no takeaway orders at the moment.'
            }
          </p>
        </div>
      ) : (
        <div className={styles.container}>
          {filteredAndSortedOrders.map(order => (
            <div key={order.orderId} className={`${styles.orderCard} ${order.isPaid ? styles.paid : styles.unpaid}`}>
              <div className={styles.header}>
                <div className={styles.orderInfo}>
                  <h3>Order #{getOrderDisplayNumber(order)}</h3>
                  <span className={styles.orderType}>Takeaway</span>
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
                <div className={styles.detailRow}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.orderDate}>
                    {new Date(order.orderDate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Status:</span>
                  <span className={styles.orderStatus}>
                    {order.orderStatus || 'N/A'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Payment:</span>
                  <div className={`${styles.paymentStatus} ${order.isPaid ? styles.paid : styles.unpaid}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </div>
                </div>
                {order.paymentMethod && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Method:</span>
                    <span className={styles.paymentMethod}>{order.paymentMethod}</span>
                  </div>
                )}
              </div>

              <div className={styles.actionButtons}>
                {!order.isPaid && (
                  <button
                    onClick={() => onMarkAsPaid(order.orderId)}
                    className={styles.payButton}
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => onRequestPickup(order.orderId)}
                  disabled={!order.isPaid}
                  className={`${styles.actionButton} ${!order.isPaid ? styles.disabled : ''}`}
                  title={!order.isPaid ? 'Payment required to request pickup' : 'Request pickup for this order'}
                >
                  Request Pickup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TakeawayOrders; 