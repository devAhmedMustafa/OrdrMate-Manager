import { useEffect, useState } from "react";
import { OrderStatus, ReservationOrder, TableReservation, tableService } from "../services/tableService";
import styles from './TableQueue.module.css';
import { Icon } from '@iconify/react';

export default function ReservationCard({index, reservation}: {index: number, reservation: TableReservation}) {

  const [reservationOrder, setReservationOrder] = useState<ReservationOrder | null>(null);

  useEffect(()=>{
    const fetchReservationOrder = async () => {
      if (reservation.reservationId) {
        const order = await tableService.getReservationOrder(reservation.reservationId);
        console.log(order);
        setReservationOrder(order);
      }
    };
    fetchReservationOrder();
  }, [reservation]);

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

  return (
    <div
      key={index}
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
      }}>
        <span style={{
          background: '#f3e5f5',
          color: '#7B1FA2',
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
      </div>

      {/* Order Preview */}
      {reservationOrder && reservationOrder.orderItems.length > 0 && (
        <div style={{ padding: '14px 20px 16px 20px', background: '#fcfbfe', borderRadius: '0 0 14px 14px' }}>
          <div style={{ fontWeight: 600, color: '#6a4c93', fontSize: 14, marginBottom: 7, letterSpacing: 0.1 }}>Order Items</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {reservationOrder.orderItems.map((orderItem, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 6, boxShadow: '0 1px 2px rgba(106,76,147,0.03)', padding: '6px 10px' }}>
                <span style={{ fontWeight: 500, color: '#7B1FA2', fontSize: 13 }}>{orderItem.item.name}</span>
                <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto', fontWeight: 500 }}>x{orderItem.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

}