import { useEffect, useState } from 'react';
import { TableReservation, OrderStatus, tableService } from './services/tableService';
import { TableQueue } from './components/TableQueue';
import styles from './Tables.module.css';
import useAuth from '../auth/useAuth.hook';
import { Icon } from '@iconify/react';
import { websocketService } from '../dashboard/services/websocketService';
import Table from './models/Table';
import ReservationNotification from './dtos/ReservationNotification';

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

        const msg = message as ReservationNotification;

        const reservation: TableReservation = {
          reservationId: msg.Reservation.ReservationId,
          tableNumber: msg.Reservation.TableNumber,
          customerName: msg.Reservation.CustomerName,
          reservationDate: msg.Reservation.ReservationDate,
          reservationStatus: msg.Reservation.ReservationStatus,
          orderId: msg.Reservation.OrderId,
          orderStatus: msg.Reservation.OrderStatus
        };

        setTableQueues(prev => ({
          ...prev,
          [reservation.tableNumber]: [
            ...(prev[reservation.tableNumber] || []),
            reservation
          ]
        }));

        setTables(prevTables => prevTables.map(t => 
          t.tableNumber === reservation.tableNumber 
            ? { ...t, reservationCount: (t.reservationCount || 0) + 1 } 
            : t
        ));
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

  const handleToggleFreeze = async (table: Table) => {
    if (!branchId || !token) return;

    try {
      if (table.isFrozen) {
        await tableService.unfreezeTable(branchId, table.tableNumber);
      } else {
        await tableService.freezeTable(branchId, table.tableNumber);
      }
      // Refresh tables
      const data = await tableService.getTables(branchId);
      setTables(data);
    } catch (error) {
      console.error('Error toggling table freeze:', error);
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
        <div className={styles.tableGrid} style={{ overflow: "visible"}}>
          {tables.map(table => (

            <div key={table.tableNumber} 
            className='h-fit w-fit'
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Freeze/Unfreeze Button - always accessible */}
              <button
                title={table.isFrozen ? 'Unfreeze Table' : 'Freeze Table'}
                style={{ position: 'absolute', top: -10, left: -10, zIndex: 3, background: table.isFrozen ? '#e57373' : '#b39ddb', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(72,43,176,0.08)', cursor: 'pointer', fontSize: 14 }}
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleToggleFreeze(table);
                }}
              >
                <Icon icon={table.isFrozen ? 'mdi:snowflake-off' : 'mdi:snowflake'} />
              </button>

              <button
                className={`${styles.tableCircle} ${selectedTable === table.tableNumber ? styles.selected : ''}`}
                onClick={() => setSelectedTable(table.tableNumber)}
                title={`Table ${table.tableNumber} (${table.seats} seats)`}
                style={table.isFrozen ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(0.7)' } : {}}
              >
                
                {/* Frozen icon overlay */}
                {table.isFrozen && (
                  <span style={{ position: 'absolute', bottom: 4, right: 4, color: '#e57373', fontSize: 18, zIndex: 2 }}>
                    <Icon icon="mdi:snowflake" />
                  </span>
                )}

                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{table.tableNumber}</span>

                <span className="absolute -left-1 -bottom-2 text-xs bg-purple-600 border-2 size-5 text-white font-bold rounded-full flex justify-center items-center">
                  <sub>{table.seats}</sub>
                </span>

                <span className="absolute -top-2 -right-1 bg-accent size-5 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {table.reservationCount}
                </span>

              </button>
            </div>
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