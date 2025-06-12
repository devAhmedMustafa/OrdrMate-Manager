import { Order, OrderStatus } from '../types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFC107';
      case 'queued':
        return '#7B1FA2';
      case 'inprogress':
      case 'in progress':
        return '#9C27B0';
      case 'ready':
        return '#4CAF50';
      case 'delivered':
        return '#607D8B';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Queued:
        return 'Queued';
      case OrderStatus.InProgress:
        return 'In Progress';
      case OrderStatus.Ready:
        return 'Ready';
      case OrderStatus.Delivered:
        return 'Delivered';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.orderInfo}>
          <h3>Order #{order.OrderId}</h3>
          {order.OrderType && (
            <span className={styles.orderType}>{order.OrderType}</span>
          )}
        </div>
        <span 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.Status) }}
        >
          {order.Status}
        </span>
      </div>
      
      {order.Items.length > 0 && (
        <div className={styles.items}>
          {order.Items.map((item, index) => (
            <div key={index} className={styles.item}>
              <span className={styles.itemName}>{item.ItemName}</span>
              <span className={styles.quantity}>x{item.Quantity}</span>
              <span className={styles.price}>${item.Price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {order.NextItem && (
        <div className={styles.nextItem}>
          <span className={styles.nextItemLabel}>Next Item:</span>
          <span className={styles.nextItemName}>{order.NextItem.ItemName}</span>
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.orderDetails}>
          {order.Customer && (
            <div className={styles.detail}>
              <span className={styles.label}>Customer:</span>
              <span className={styles.value}>{order.Customer}</span>
            </div>
          )}
          {order.OrderDate && (
            <div className={styles.detail}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>
                {new Date(order.OrderDate).toLocaleString()}
              </span>
            </div>
          )}
          <div className={styles.detail}>
            <span className={styles.label}>Total:</span>
            <span className={styles.total}>
              ${order.TotalAmount?.toFixed(2) || order.Items.reduce((sum, item) => sum + (item.Price * item.Quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
        {order.IsBeingPrepared && (
          <span className={styles.preparing}>Preparing...</span>
        )}
      </div>
    </div>
  );
} 