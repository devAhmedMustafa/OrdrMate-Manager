import { useState } from 'react';
import { TableQueue } from './components/TableQueue';
import styles from './Tables.module.css';
import { Icon } from '@iconify/react';
import { TableProvider, useTableContext } from './context/TableContext';

const TablesContent = () => {
  const {
    tables,
    selectedTable,
    tableQueues,
    draggedReservation,
    dragPreviewPos,
    dragOverTableNumber,
    setSelectedTable,
    setDraggedReservation,
    setDragOverTableNumber,
    moveReservation,
    refreshTableQueue,
    freezeTable,
    unfreezeTable,
    createTable
  } = useTableContext();

  const [isAdding, setIsAdding] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '', seats: '' });

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTable(parseInt(newTable.tableNumber), parseInt(newTable.seats));
      setNewTable({ tableNumber: '', seats: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleDequeue = async () => {
    if (!selectedTable) return;
    
    try {
      await refreshTableQueue(selectedTable);
    } catch (error) {
      console.error('Error refreshing table queue:', error);
    }
  };

  const handleToggleFreeze = async (table: any) => {
    try {
      if (table.isFrozen) {
        await unfreezeTable(table.tableNumber);
      } else {
        await freezeTable(table.tableNumber);
      }
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
          {/* Drag state for ghost effect */}
          {tables.map(table => {
            // Drop handler
            const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragOverTableNumber(null);
              if (table.isFrozen) return;
              if (!draggedReservation) return;
              const { reservation } = draggedReservation;
              if (reservation.tableNumber === table.tableNumber) return;

              try {
                await moveReservation(reservation.reservationId, table.tableNumber, reservation.tableNumber);
              } catch (error) {
                console.error('Error moving reservation:', error);
              }
              setDraggedReservation(null);
            };

            return (
              <div
                key={table.tableNumber}
                className={`h-fit w-fit ${dragOverTableNumber === table.tableNumber ? styles.dragOverTarget : ''}`}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}
                onDragOver={e => {
                  if (!table.isFrozen) {
                    e.preventDefault();
                    setDragOverTableNumber(table.tableNumber);
                  }
                }}
                onDragLeave={() => setDragOverTableNumber(null)}
                onDrop={handleDrop}
              >
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
                  // Add aria-dropeffect for accessibility
                  aria-dropeffect={dragOverTableNumber === table.tableNumber ? 'move' : undefined}
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
            );
          })}
      {/* Custom drag preview layer */}
      {draggedReservation && (
        <div
          style={{
            position: 'fixed',
            left: dragPreviewPos.x,
            top: dragPreviewPos.y,
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0.95,
          }}
        >
          {/* Minimal preview of the reservation card */}
          <div className={styles.draggingCard} style={{ minWidth: 180, padding: 8, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(123,31,162,0.18)', border: '2px solid #7B1FA2', color: '#222', fontWeight: 500 }}>
            <span style={{ fontWeight: 600 }}>{draggedReservation.reservation.customerName}</span><br />
            <span style={{ fontSize: 13 }}>Table {draggedReservation.reservation.tableNumber}</span>
          </div>
        </div>
      )}
        </div>

        <div className={styles.queueSection}>
          {selectedTable ? (
            <TableQueue
              tableNumber={selectedTable}
              reservations={tableQueues[selectedTable] || []}
              onDequeue={handleDequeue}
              onReservationDragStart={(reservation, e) => {
                // Get mouse offset within the card
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setDraggedReservation({
                  reservation,
                  offsetX: e.clientX - rect.left,
                  offsetY: e.clientY - rect.top
                });
              }}
              onReservationDragEnd={() => setDraggedReservation(null)}
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
};

export function Tables() {
  return (
    <TableProvider>
      <TablesContent />
    </TableProvider>
  );
} 