import { Order } from '../types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {

  console.log("Rendering OrderCard for OrderId:", order);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return '#FFA726';
      case 'Queued':
        return '#FFB74D';
      case 'InProgress':
        return '#42A5F5';
      case 'Ready':
        return '#66BB6A';
      case 'Delivered':
        return '#66BB6A';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.orderInfo}>
          <h3>Order #{order.OrderId}</h3>
          {order.OrderType && (
            <span className={styles.orderType}>{order.OrderType} | {order.OrderType == "DineIn" ? `Table ${order.tableNumber}` : `Order #${order.orderNumber}`}</span>
          )}
          <span className={styles.date}>{new Date(order.OrderDate || '').toLocaleString()}</span>
        </div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.Status) }}
        >
          {order.Status}
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