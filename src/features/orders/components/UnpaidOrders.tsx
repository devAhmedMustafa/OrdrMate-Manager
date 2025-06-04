import { UnpaidOrder, OrderStatus } from '../types';
import styles from './UnpaidOrders.module.css';

interface UnpaidOrdersProps {
  orders: UnpaidOrder[];
  onMarkAsPaid: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export function UnpaidOrders({ orders, onMarkAsPaid, onStatusChange }: UnpaidOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        No unpaid orders found
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {orders.map(order => (
        <div key={order.orderId} className={styles.orderCard}>
          <div className={styles.header}>
            <div className={styles.orderInfo}>
              <h3>Order #{order.orderNumber}</h3>
              <span className={styles.orderType}>{order.orderType}</span>
            </div>
            <div className={styles.amount}>
              ${order.totalAmount.toFixed(2)}
            </div>
          </div>

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Customer:</span>
              <span>{order.customer}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Table:</span>
              <span>{order.tableNumber || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Payment Method:</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Date:</span>
              <span>{new Date(order.orderDate).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Status:</span>
              <select 
                value={order.orderStatus}
                onChange={(e) => onStatusChange(order.orderId, e.target.value as OrderStatus)}
                className={styles.statusSelect}
              >
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
  );
} 