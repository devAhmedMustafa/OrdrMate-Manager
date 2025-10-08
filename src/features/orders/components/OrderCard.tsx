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

      {/* Delivery Details Section */}
      {order.orderType === 'Delivery' && order.deliveryDetails && (
        <div className={styles.deliverySection}>
          <div className={styles.deliveryHeader}>
            <span className={styles.deliveryIcon}>🚚</span>
            <span className={styles.deliveryTitle}>Delivery Address</span>
          </div>
          <div className={styles.deliveryAddress}>
            {order.deliveryDetails.address}
          </div>
          {order.deliveryDetails.latitude && order.deliveryDetails.longitude && (
            <div className={styles.deliveryCoords}>
              <span className={styles.coordsText}>
                📍 {order.deliveryDetails.latitude.toFixed(6)}, {order.deliveryDetails.longitude.toFixed(6)}
              </span>
            </div>
          )}
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

          {order.customerPhone && (
            <div className={styles.detail}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{order.customerPhone}</span>
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

          {order.paymentMethod && (
            <div className={styles.detail}>
              <span className={styles.label}>Payment:</span>
              <span className={styles.value}>{order.paymentMethod}</span>
            </div>
          )}
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