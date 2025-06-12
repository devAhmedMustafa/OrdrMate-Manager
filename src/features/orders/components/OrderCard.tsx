import { Order, OrderStatus } from '../types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.Pending:
        return '#FFA726';
      case OrderStatus.InProgress:
        return '#42A5F5';
      case OrderStatus.Ready:
        return '#66BB6A';
      case OrderStatus.Delivered:
        return '#66BB6A';
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
          <span className={styles.date}>{new Date(order.OrderDate || '').toLocaleString()}</span>
        </div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.Status as unknown as OrderStatus) }}
        >
          {getStatusText(order.Status as unknown as OrderStatus)}
        </div>
      </div>
      
      {order.Items.length > 0 && (
        <div className={styles.items}>
          {order.Items.map((item, index) => (
            <div key={index} className={styles.item}>
              <span className={styles.quantity}>{item.Quantity}x</span>
              <span className={styles.name}>{item.ItemName}</span>
              {item.Notes && <span className={styles.notes}>{item.Notes}</span>}
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