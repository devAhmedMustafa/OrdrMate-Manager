import { UnpaidOrder } from '../types';
import styles from './UnpaidOrders.module.css';

interface UnpaidOrdersProps {
  orders: UnpaidOrder[];
  onMarkAsPaid: (orderId: string) => void;
}

export function UnpaidOrders({ orders, onMarkAsPaid }: UnpaidOrdersProps) {
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