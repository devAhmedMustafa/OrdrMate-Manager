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

  const getPaymentStatusColor = (isPaid: boolean): string => {
    return isPaid ? '#4CAF50' : '#F44336';
  };

  const getPaymentStatusText = (isPaid: boolean): string => {
    return isPaid ? 'Paid' : 'Unpaid';
  };

  const getPaymentIcon = (isPaid: boolean): string => {
    return isPaid ? 'mdi:check-circle' : 'mdi:clock-outline';
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
          {/* Payment Status Badge */}
          <div 
            className={styles.paymentStatus}
            style={{ 
              backgroundColor: getPaymentStatusColor(order.isPaid || false),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '8px'
            }}
            title={`Payment Status: ${getPaymentStatusText(order.isPaid || false)}`}
          >
            <Icon icon={getPaymentIcon(order.isPaid || false)} style={{ fontSize: '14px' }} />
            {getPaymentStatusText(order.isPaid || false)}
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

          {/* Payment Provider: */}
          <div className={styles.detail}>
            <span className={styles.label}>Payment Provider:</span>
            
            <span className={styles.value}>{order.paymentProvider || 'N/A'}</span>
          </div>

          {/* Payment Status in Footer */}
          <div className={styles.detail}>
            <span className={styles.label}>Payment:</span>
            <span 
              className={styles.value}
              style={{ 
                color: getPaymentStatusColor(order.isPaid || false),
                fontWeight: 'bold'
              }}
            >
              {getPaymentStatusText(order.isPaid || false)}
            </span>
          </div>
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