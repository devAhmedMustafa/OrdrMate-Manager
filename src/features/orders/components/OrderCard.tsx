import Order from '../models/Order';
import styles from './OrderCard.module.css';
import { printOrderInvoice } from '../utils/printOrder';
import { Icon } from '@iconify/react';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    printOrderInvoice(order);
  };

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
          <h3>Order #{order.orderId}</h3>
          {order.orderType && (
            <span className={styles.orderType}>{order.orderType} | {order.orderType == "DineIn" ? `Table ${order.tableNumber}` : `Order #${order.orderNumber}`}</span>
          )}
          <span className={styles.date}>{new Date(order.orderDate || '').toLocaleString()}</span>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.printButton}
            onClick={handlePrint}
            title="Print Order"
          >
            <Icon icon="mdi:printer" />
          </button>
          <div 
            className={styles.status}
            style={{ backgroundColor: getStatusColor(order.orderStatus) }}
          >
            {order.orderStatus}
          </div>
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
              ${order.totalAmount?.toFixed(2) || order.orderItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 