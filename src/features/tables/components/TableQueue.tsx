import { TableReservation, OrderStatus, tableService } from '../services/tableService';
import styles from './TableQueue.module.css';
import { Icon } from '@iconify/react';
import useAuth from '../../auth/useAuth.hook';

interface TableQueueProps {
  tableNumber: number;
  reservations: TableReservation[];
  onDequeue?: () => void;
}

export function TableQueue({ tableNumber, reservations, onDequeue }: TableQueueProps) {
  const { branchId, token } = useAuth();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'seated':
        return 'mdi:chair-rolling';
      case 'pending':
        return 'mdi:clock-outline';
      case 'confirmed':
        return 'mdi:check-circle-outline';
      case 'cancelled':
        return 'mdi:close-circle-outline';
      case 'completed':
        return 'mdi:flag-checkered';
      default:
        return 'mdi:information-outline';
    }
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Queued:
        return '#FFA726'; // Orange
      case OrderStatus.Ready:
        return '#66BB6A'; // Green
      case OrderStatus.Delivered:
        return '#42A5F5'; // Blue
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const handleDequeue = async () => {
    if (!branchId || !token) return;
    
    try {
      await tableService.dequeueTable(branchId, tableNumber);
      if (onDequeue) {
        onDequeue();
      }
    } catch (error) {
      console.error('Error dequeuing table:', error);
    }
  };

  return (
    <div className={styles.tableQueue}>
      <div className={styles.header}>
        <h2>
          <Icon icon="mdi:table-furniture" className={styles.icon} />
          Table {tableNumber} Queue
        </h2>
        {reservations.length > 0 && (
          <button 
            className={styles.dequeueButton}
            onClick={handleDequeue}
            title="Dequeue table"
          >
            <Icon icon="mdi:table-remove" className={styles.icon} />
            Dequeue
          </button>
        )}
      </div>
      <div className={styles.queueList}>
        {reservations.length === 0 ? (
          <p className={styles.noReservations}>
            <Icon icon="mdi:table-off" className={styles.icon} />
            No reservations for this table
          </p>
        ) : (
          reservations.map((reservation, index) => (
            <div 
              key={index} 
              className={`${styles.reservationCard} ${
                reservation.reservationStatus.toLowerCase() === 'seated' ? styles.seated : ''
              }`}
              style={{
                background: reservation.reservationStatus.toLowerCase() === 'seated' 
                  ? `linear-gradient(135deg, #8a63d2, #6a4c93)`
                  : `linear-gradient(135deg, ${getOrderStatusColor(reservation.orderStatus)}, ${getOrderStatusColor(reservation.orderStatus)}99)`
              }}
            >
              <div className={styles.customerInfo}>
                <h3>
                  <Icon icon="mdi:account" className={styles.icon} />
                  {reservation.customerName}
                </h3>
                <p>
                  <Icon icon="mdi:calendar-clock" className={styles.icon} />
                  {new Date(reservation.reservationDate).toLocaleString()}
                </p>
              </div>
              <div className={styles.statusInfo}>
                <span className={`${styles.status} ${styles[reservation.reservationStatus.toLowerCase()]}`}>
                  <Icon icon={getStatusIcon(reservation.reservationStatus)} className={styles.icon} />
                  {reservation.reservationStatus}
                </span>
                {reservation.orderId && (
                  <span className={styles.orderId}>
                    <Icon icon="mdi:receipt" className={styles.icon} />
                    Order: {reservation.orderId}
                    <span className={styles.orderStatus}>
                      ({reservation.orderStatus})
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 