import { useEffect, useState } from 'react';
import { Table, TableReservation, OrderStatus, tableService } from './services/tableService';
import { TableQueue } from './components/TableQueue';
import styles from './Tables.module.css';
import useAuth from '../auth/useAuth.hook';
import { Icon } from '@iconify/react';
import { websocketService } from '../dashboard/services/websocketService';

export function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableQueues, setTableQueues] = useState<Record<number, TableReservation[]>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '', seats: '' });
  const { branchId, token } = useAuth();

  useEffect(() => {
    if (!branchId || !token) return;

    const fetchTables = async () => {
      try {
        const data = await tableService.getTables(branchId);
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, [branchId, token]);

  useEffect(() => {
    if (!branchId || !token || !selectedTable) return;

    const fetchTableQueue = async () => {
      try {
        const data = await tableService.getTableQueue(branchId, selectedTable);
        setTableQueues(prev => ({
          ...prev,
          [selectedTable]: data
        }));
      } catch (error) {
        console.error('Error fetching table queue:', error);
      }
    };

    fetchTableQueue();
    const interval = setInterval(fetchTableQueue, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [branchId, token, selectedTable]);

  useEffect(() => {
    // Subscribe to WebSocket messages
    const handleMessage = (message: any) => {
      if (!message.Type) return;

      if (message.Type === 'TableReserved') {
        const reservation: TableReservation = {
          tableNumber: message.Reservation.TableNumber,
          customerName: message.Reservation.CustomerName,
          reservationDate: message.Reservation.ReservationDate,
          reservationStatus: message.Reservation.ReservationStatus,
          orderId: message.Reservation.OrderId,
          orderStatus: OrderStatus.Queued
        };

        setTableQueues(prev => ({
          ...prev,
          [reservation.tableNumber]: [
            ...(prev[reservation.tableNumber] || []),
            reservation
          ]
        }));
      } else if (message.Type === 'OrderReady') {
        const orderId = message.OrderId;
        
        setTableQueues(prev => {
          const newQueues = { ...prev };
          Object.keys(newQueues).forEach(tableNumber => {
            const reservations = newQueues[parseInt(tableNumber)];
            const reservationIndex = reservations.findIndex(r => r.orderId === orderId);
            if (reservationIndex !== -1) {
              newQueues[parseInt(tableNumber)][reservationIndex] = {
                ...reservations[reservationIndex],
                orderStatus: OrderStatus.Ready
              };
            }
          });
          return newQueues;
        });
      }
    };

    websocketService.on('message', handleMessage);

    return () => {
      websocketService.off('message', handleMessage);
    };
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !token) return;
    
    try {
      await tableService.createTable({
        tableNumber: parseInt(newTable.tableNumber),
        seats: parseInt(newTable.seats),
        branchId
      });
      setNewTable({ tableNumber: '', seats: '' });
      setIsAdding(false);
      // Refresh tables list
      const data = await tableService.getTables(branchId);
      setTables(data);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleDequeue = async () => {
    if (!branchId || !token || !selectedTable) return;
    
    try {
      const data = await tableService.getTableQueue(branchId, selectedTable);
      setTableQueues(prev => ({
        ...prev,
        [selectedTable]: data
      }));
    } catch (error) {
      console.error('Error refreshing table queue:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tables</h1>
        <button 
          className={styles.addButton}
          onClick={() => setIsAdding(true)}
        >
          <Icon icon="mdi:table-plus" className={styles.icon} />
          Add Table
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTable} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="tableNumber">Table Number</label>
            <input
              type="number"
              id="tableNumber"
              value={newTable.tableNumber}
              onChange={(e) => setNewTable(prev => ({ ...prev, tableNumber: e.target.value }))}
              required
              min="1"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="seats">Number of Seats</label>
            <input
              type="number"
              id="seats"
              value={newTable.seats}
              onChange={(e) => setNewTable(prev => ({ ...prev, seats: e.target.value }))}
              required
              min="1"
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Add Table
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.content}>
        <div className={styles.tableList}>
          {tables.map(table => (
            <button
              key={table.tableNumber}
              className={`${styles.tableButton} ${selectedTable === table.tableNumber ? styles.selected : ''}`}
              onClick={() => setSelectedTable(table.tableNumber)}
            >
              <span className={styles.tableNumber}>Table {table.tableNumber}</span>
              <span className={styles.seats}>{table.seats} seats</span>
            </button>
          ))}
        </div>

        <div className={styles.queueSection}>
          {selectedTable ? (
            <TableQueue
              tableNumber={selectedTable}
              reservations={tableQueues[selectedTable] || []}
              onDequeue={handleDequeue}
            />
          ) : (
            <div className={styles.noTableSelected}>
              <p>Select a table to view its reservation queue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 