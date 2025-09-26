import { useEffect, useState, useRef } from "react";
import { OrderStatus, ReservationOrder, TableReservation, tableService } from "../services/tableService";
import { Icon } from '@iconify/react';
import useAuth from "../../auth/useAuth.hook";
import OrderCustomization from "../../customizations/models/OrderCustomization.Model";
import { customizationService } from "../../customizations";
import styles from '../Tables.module.css';
import { useTableContext } from '../context/TableContext';

interface ReservationCardProps {
  index: number;
  reservation: TableReservation;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export default function ReservationCard({index, reservation, onDragStart, onDragEnd}: ReservationCardProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const { updateReservationInQueue } = useTableContext();

  // Drag event handlers for moving reservation to another table
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/ordrmate-reservation', JSON.stringify({
      reservationId: reservation.reservationId,
      fromTable: reservation.tableNumber
    }));
    e.dataTransfer.effectAllowed = 'move';
    // Add ghost effect
    if (dragRef.current) {
      dragRef.current.classList.add(styles.draggingCard);
    }
    if (onDragStart) onDragStart(e);
  };

  const handleDragEnd = () => {
    if (dragRef.current) {
      dragRef.current.classList.remove(styles.draggingCard);
    }
    if (onDragEnd) onDragEnd();
  };

  const [reservationOrder, setReservationOrder] = useState<ReservationOrder | null>(null);
  const [orderCustomizations, setOrderCustomizations] = useState<OrderCustomization | null>(null);
  const {branchId} = useAuth();

  useEffect(()=>{
    
    const fetchReservationOrder = async () => {
      if (reservation.reservationId) {
        const order = await tableService.getReservationOrder(reservation.reservationId);
        setReservationOrder(order);
      }
    };

    fetchReservationOrder();
  }, [reservation]);

  useEffect(()=>{

    const fetchOrderCustomizations = async () => {
      if(reservationOrder && reservationOrder.orderId){
        const customizations = await customizationService.getOrderCustomizationByReservation(reservation.reservationId);
        setOrderCustomizations(new OrderCustomization(customizations));
      }
    };

    fetchOrderCustomizations();
  }, [reservationOrder]);

  async function handleSetOrderReady(){
    if(reservationOrder && reservationOrder.orderId){
      await tableService.setOrdersAsReady(reservation.reservationId);
      setReservationOrder({...reservationOrder, orderStatus: OrderStatus.Ready});
      // Update the reservation in the table queue context
      updateReservationInQueue(reservation.tableNumber, reservation.reservationId, {
        orderStatus: OrderStatus.Ready
      });
    }
  }

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

  const getReservationStatusColor = (status: string) => {
      switch (status) {
      case 'Pending':
          return '#FF7043'; // Red-Orange
      case 'Queued':
          return '#FFA726'; // Orange
      case 'Seated':
          return '#66bb82'; // Green
      default:
          return '#9E9E9E'; // Grey
      }
  };

  return (
    <div
      key={index}
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        background: '#fff',
        border: '1px solid #ececec',
        boxShadow: '0 2px 8px rgba(106,76,147,0.06)',
        borderRadius: 14,
        padding: 0,
        margin: '0 0 20px 0',
        minWidth: 260,
        maxWidth: 400,
        width: '100%',
        overflow: 'hidden',
        fontFamily: 'inherit',
        transition: 'box-shadow 0.18s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'grab',
      }}
    >
      {/* Top section: Customer and details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '18px 20px 10px 20px',
        background: '#faf9fc',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#6a4c93', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon icon="mdi:account" style={{ fontSize: 19, opacity: 0.85 }} />
          {reservation.customerName}
        </span>
        <span style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon icon="mdi:calendar-clock" style={{ fontSize: 15, opacity: 0.7 }} />
          {new Date(reservation.reservationDate).toLocaleString()}
        </span>
      </div>

      {/* Status below details */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0 0 0',
        background: '#faf9fc',
        flexGrow: 1,
      }}>
        <span style={{
          background: getReservationStatusColor(reservation.reservationStatus),
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 8,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          letterSpacing: 0.1,
        }}>
          <Icon icon={getStatusIcon(reservation.reservationStatus)} style={{ fontSize: 15, opacity: 0.8 }} />
          {reservation.reservationStatus}
        </span>

        {/* Confirm table if status is waiting  */}
        {(reservation.reservationStatus.toLowerCase() === 'waiting') && (

          <div className="bg-emerald-400 text-white size-7 flex justify-center items-center rounded-full cursor-pointer hover:bg-emerald-600 transition ml-3" title="Confirm Reservation">

            <button className="w-fit" onClick={async()=> {
              await tableService.confirmTableReservation(branchId!, reservation.tableNumber);
              updateReservationInQueue(reservation.tableNumber, reservation.reservationId, { reservationStatus: 'Seated' });
            }}>
              <Icon icon="mdi:check" style={{ fontSize: 15 }} />
            </button>
            
          </div>

        )}
      </div>

      {/* Order Preview */}
      {reservationOrder && reservationOrder.orderItems.length > 0 ? (

        <div style={{ padding: '14px 20px 16px 20px', background: '#fcfbfe', borderRadius: '0 0 14px 14px', height: "100%" }}>

          <div style={{ fontWeight: 600, color: '#6a4c93', fontSize: 14, marginBottom: 7, letterSpacing: 0.1 }}>Order Items</div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>

            {reservationOrder.orderItems.map((orderItem, idx) => (

              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px rgba(106,76,147,0.03)', padding: '6px 10px' }}>

                <span style={{ fontWeight: 500, color: '#7B1FA2', fontSize: 13 }}>
                  {orderItem.item.name}
                </span>
                <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto', fontWeight: 500 }}>
                  x{orderItem.quantity}
                </span>

                {/* Customizations */}
                {orderCustomizations && (
                  orderCustomizations.items[orderItem.itemId] && (
                  <div style={{
                    marginLeft: 8,
                    background: '#f4f0fa',
                    borderRadius: 5,
                    padding: '2px 8px',
                    fontSize: 12,
                    color: '#6a4c93',
                    fontWeight: 500,
                    display: 'inline-block',
                  }}>
                    {Object.entries(orderCustomizations.items[orderItem.itemId]).map(([key, value]) => (
                      <span key={key} style={{ marginRight: 8 }}>
                        <strong>{key}:</strong> {String(value)}
                      </span>
                    ))}
                  </div>
                ))}
              </li>

            ))}
            
          </ul>

        </div>

      ) : (
        <div style={{ padding: '14px 20px 16px 20px', background: '#fcfbfe', borderRadius: '0 0 14px 14px', height: "100%" }}>
          <div style={{ fontWeight: 500, color: '#888', fontSize: 13, textAlign: 'center' }}>
            No order associated with this reservation.
          </div>
        </div>
      )
      }

      {/* Pay Order Button */}
      {(reservation.reservationId && reservationOrder?.isPaid === false) && (
        <div className="bg-blue-500 text-white p-3 rounded-b-lg cursor-pointer hover:bg-blue-700 transition">
          <button className="w-full flex justify-center items-center" onClick={async()=>{
            if(reservationOrder && reservationOrder.orderId){
              await tableService.payOrders(reservation.reservationId);
              setReservationOrder({...reservationOrder, isPaid: true});
            }
          }}>
            <Icon icon="mdi:currency-usd" style={{ fontSize: 15, marginLeft: 5 }} />
            <span className="ml-2">Mark as Paid</span>
          </button>
        </div>
      )}

      {/* Confirm Button */}
      {(reservationOrder?.orderId && reservationOrder.orderStatus == OrderStatus.Queued) && (
        <div className="bg-emerald-400 text-white p-3 rounded-b-lg cursor-pointer hover:bg-emerald-600 transition">
          <button className="w-full" onClick={handleSetOrderReady}>
            <Icon icon="mdi:check" style={{ fontSize: 15, marginLeft: 5 }} />
          </button>
        </div>
      )}
    </div>
  );

}