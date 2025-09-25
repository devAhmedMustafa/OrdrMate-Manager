import { useEffect } from 'react';
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
          <h3>Order #{order.orderId}</h3>
          {order.orderType && (
            <span className={styles.orderType}>{order.orderType}</span>
          )}
          <span className={styles.date}>{new Date(order.orderDate || '').toLocaleString()}</span>
        </div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(order.status as unknown as OrderStatus) }}
        >
          {getStatusText(order.status as unknown as OrderStatus)}
        </div>
      </div>
      
      {order.orderItems.length > 0 && (
        <div className={styles.items}>
          {order.orderItems.map((item, index) => (
            <div key={index} className={styles.item}>
              <span className={styles.quantity}>{item.quantity}x</span>
              <span className={styles.name}>{item.item.name}</span>
              {item.notes && <span className={styles.notes}>{item.notes}</span>}
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
      </div>
    </div>
  );
} 