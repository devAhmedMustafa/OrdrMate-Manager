import { Order, OrderStatus } from '../types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return '#FFC107';
      case OrderStatus.Queued:
        return '#7B1FA2';
      case OrderStatus.InProgress:
        return '#9C27B0';
      case OrderStatus.Ready:
        return '#4CAF50';
      case OrderStatus.Delivered:
        return '#607D8B';
      case OrderStatus.Cancelled:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    return OrderStatus[status];
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3>Order #{order.OrderId}</h3>
        <span 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.Status) }}
        >
          {getStatusText(order.Status)}
        </span>
      </div>
      
      <div className={styles.items}>
        {order.Items.map((item, index) => (
          <div key={index} className={styles.item}>
            <span className={styles.itemName}>{item.ItemName}</span>
            <span className={styles.quantity}>x{item.Quantity}</span>
            <span className={styles.price}>${item.Price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.NextItem && (
        <div className={styles.nextItem}>
          <span className={styles.nextItemLabel}>Next Item:</span>
          <span className={styles.nextItemName}>{order.NextItem.ItemName}</span>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.total}>
          Total: ${order.Items.reduce((sum, item) => sum + (item.Price * item.Quantity), 0).toFixed(2)}
        </span>
        {order.IsBeingPrepared && (
          <span className={styles.preparing}>Preparing...</span>
        )}
      </div>
    </div>
  );
} 