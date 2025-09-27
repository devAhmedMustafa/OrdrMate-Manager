import styles from './TableQueue.module.css';
import { Icon } from '@iconify/react';
import ReservationCard from './ReservationCard';
import { useTableContext } from '../context/TableContext';

interface TableQueueProps {
  tableNumber: number;
  reservations: any[];
  onDequeue?: () => void;
  onReservationDragStart?: (reservation: any, e: React.DragEvent) => void;
  onReservationDragEnd?: () => void;
}

export function TableQueue({ tableNumber, reservations, onDequeue, onReservationDragStart, onReservationDragEnd }: TableQueueProps) {
  const { dequeueTable } = useTableContext();

  const handleDequeue = async () => {
    try {
      await dequeueTable(tableNumber);
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
            <ReservationCard
              key={index}
              index={index}
              reservation={reservation}
              onDragStart={onReservationDragStart ? (e) => onReservationDragStart(reservation, e) : undefined}
              onDragEnd={onReservationDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
} 