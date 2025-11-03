import React, { createContext, useContext, useEffect, useState } from 'react';
import useAuth from '../../auth/useAuth.hook';
import { websocketService } from '../../dashboard/services/websocketService';
import ReservationNotification from '../dtos/ReservationNotification';
import TableReservationResponse from '../dtos/TableReservationResponse';
import TableResponse from '../dtos/TableResponse.dto';
import tableService from '../services/tableService';
import { OrderStatus } from '../../orders/types';
import OrderStatusMapper from '../../orders/mappers/orderStatusMapper';

// Type for drag state
type DraggedReservation = {
  reservation: TableReservationResponse;
  offsetX: number;
  offsetY: number;
};

interface TableContextType {
  // State
  tables: TableResponse[];
  selectedTable: number | null;
  tableQueues: Record<number, TableReservationResponse[]>;
  draggedReservation: DraggedReservation | null;
  dragPreviewPos: { x: number; y: number };
  dragOverTableNumber: number | null;
  
  // Actions
  setSelectedTable: (tableNumber: number | null) => void;
  setDraggedReservation: (draggedReservation: DraggedReservation | null) => void;
  setDragPreviewPos: (pos: { x: number; y: number }) => void;
  setDragOverTableNumber: (tableNumber: number | null) => void;
  moveReservation: (reservationId: string, toTableNumber: number, fromTableNumber: number) => Promise<void>;
  refreshTableQueue: (tableNumber: number) => Promise<void>;
  refreshTables: () => Promise<void>;
  dequeueTable: (tableNumber: number) => Promise<void>;
  freezeTable: (tableNumber: number) => Promise<void>;
  unfreezeTable: (tableNumber: number) => Promise<void>;
  createTable: (tableNumber: number, seats: number) => Promise<void>;
  updateReservationInQueue: (tableNumber: number, reservationId: string, updates: Partial<TableReservationResponse>) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};

interface TableProviderProps {
  children: React.ReactNode;
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableQueues, setTableQueues] = useState<Record<number, TableReservationResponse[]>>({});
  const [draggedReservation, setDraggedReservation] = useState<DraggedReservation | null>(null);
  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOverTableNumber, setDragOverTableNumber] = useState<number | null>(null);
  
  const { branchId, token } = useAuth();

  // Mousemove handler for drag preview
  useEffect(() => {
    if (!draggedReservation) return;
    const handleMouseMove = (e: MouseEvent) => {
      setDragPreviewPos({
        x: e.clientX - draggedReservation.offsetX,
        y: e.clientY - draggedReservation.offsetY
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [draggedReservation]);

  // Load tables on mount
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

  // Load selected table queue
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

  // WebSocket subscription
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (!message.Type) return;

      if (message.Type === 'TableReserved') {
        const msg = message as ReservationNotification;

        const reservation: TableReservationResponse = {
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
                orderStatus: OrderStatusMapper.fromOrderStatusToString(OrderStatus.Ready)
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

  // Actions
  const moveReservation = async (reservationId: string, toTableNumber: number, fromTableNumber: number) => {
    if (!branchId) return;
    
    try {
      await tableService.moveReservation(reservationId, toTableNumber);
      // Refresh both old and new table queues from backend
      const [oldQueue, newQueue] = await Promise.all([
        tableService.getTableQueue(branchId, fromTableNumber),
        tableService.getTableQueue(branchId, toTableNumber)
      ]);
      setTableQueues(prev => ({
        ...prev,
        [fromTableNumber]: oldQueue,
        [toTableNumber]: newQueue
      }));
      setSelectedTable(toTableNumber); // Switch to new table after move
    } catch (error) {
      console.error('Error moving reservation:', error);
      throw error;
    }
  };

  const refreshTableQueue = async (tableNumber: number) => {
    if (!branchId || !token) return;
    
    try {
      const data = await tableService.getTableQueue(branchId, tableNumber);
      setTableQueues(prev => ({
        ...prev,
        [tableNumber]: data
      }));
    } catch (error) {
      console.error('Error refreshing table queue:', error);
      throw error;
    }
  };

  const refreshTables = async () => {
    if (!branchId || !token) return;
    
    try {
      const data = await tableService.getTables(branchId);
      setTables(data);
    } catch (error) {
      console.error('Error refreshing tables:', error);
      throw error;
    }
  };

  const dequeueTable = async (tableNumber: number) => {
    if (!branchId || !token) return;
    
    try {
      await tableService.dequeTable(branchId, tableNumber);
      await refreshTableQueue(tableNumber);
    } catch (error) {
      console.error('Error dequeuing table:', error);
      throw error;
    }
  };

  const freezeTable = async (tableNumber: number) => {
    if (!branchId || !token) return;

    try {
      await tableService.freezeTable(branchId, tableNumber);
      await refreshTables();
    } catch (error) {
      console.error('Error freezing table:', error);
      throw error;
    }
  };

  const unfreezeTable = async (tableNumber: number) => {
    if (!branchId || !token) return;

    try {
      await tableService.unfreezeTable(branchId, tableNumber);
      await refreshTables();
    } catch (error) {
      console.error('Error unfreezing table:', error);
      throw error;
    }
  };

  const createTable = async (tableNumber: number, seats: number) => {
    if (!branchId || !token) return;
    
    try {
      await tableService.createTable(
        branchId,
        tableNumber,
        seats
      );
      await refreshTables();
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  };

  const updateReservationInQueue = (tableNumber: number, reservationId: string, updates: Partial<TableReservationResponse>) => {
    setTableQueues(prev => ({
      ...prev,
      [tableNumber]: (prev[tableNumber] || []).map(reservation => 
        reservation.reservationId === reservationId 
          ? { ...reservation, ...updates }
          : reservation
      )
    }));
  };

  const contextValue: TableContextType = {
    // State
    tables,
    selectedTable,
    tableQueues,
    draggedReservation,
    dragPreviewPos,
    dragOverTableNumber,
    
    // Actions
    setSelectedTable,
    setDraggedReservation,
    setDragPreviewPos,
    setDragOverTableNumber,
    moveReservation,
    refreshTableQueue,
    refreshTables,
    dequeueTable,
    freezeTable,
    unfreezeTable,
    createTable,
    updateReservationInQueue,
  };

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};