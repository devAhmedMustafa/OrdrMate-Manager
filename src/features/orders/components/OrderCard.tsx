import { Order } from '../types';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onConfirmOrder?: (orderId: string) => void;
}

export function OrderCard({ order, onClick, onConfirmOrder }: OrderCardProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Pending":
        return '#FFA726';
      case "Queued":
        return '#3a1cbe';
      case "InProgress":
        return '#42A5F5';
      case "Ready":
        return '#66BB6A';
      case "Delivered":
        return '#66BB6A';
      default:
        return '#9E9E9E';
    }
  };

  const handleConfirmOrder = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (onConfirmOrder) {
      onConfirmOrder(order.orderId);
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.orderInfo}>
          <h3>Order #{order.orderId}</h3>
          {order.orderType && (
            <span className={styles.orderType}>{order.orderType}</span>
          )}
          <span className={styles.date}>{new Date(order.orderDate || '').toLocaleString()}</span>
        </div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.orderStatus) }}
        >
          {order.orderStatus}
        </div>
      </div>
      
      {order.orderItems.length > 0 && (
        <div className={styles.items}>
          {order.orderItems.map((item, index) => (
            <div key={index} className={styles.item}>
              <span className={styles.name}>{item.item.name}</span>
              <span className={styles.quantity}>{item.quantity}x</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.orderDetails}>
          {order.customer && (
            <div className={styles.detail}>
              <span className={styles.label}>Customer:</span>
              <span className={styles.value}>{order.customer}</span>
            </div>
          )}
          {order.orderDate && (
            <div className={styles.detail}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>
                {new Date(order.orderDate).toLocaleString()}
              </span>
            </div>
          )}
          <div className={styles.detail}>
            <span className={styles.label}>Total:</span>
            <span className={styles.total}>
              ${order.totalAmount?.toFixed(2) || order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        {onConfirmOrder && (
          <button 
            className={styles.confirmButton}
            onClick={handleConfirmOrder}
          >
            Confirm Order
          </button>
        )}
      </div>
    </div>
  );
} 