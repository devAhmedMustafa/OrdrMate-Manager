import { useEffect, useState, useRef } from "react";
import { ReservationOrder, tableCloudService } from "../services/tableCloudService";
import { Icon } from '@iconify/react';
import useAuth from "../../auth/useAuth.hook";
import OrderCustomization from "../../customizations/models/OrderCustomization.Model";
import styles from '../Tables.module.css';
import { useTableContext } from '../context/TableContext';
import { printOrderInvoice, printOrderItems } from "../../orders/utils/printOrder";
import TableReservationResponse from "../dtos/TableReservationResponse";
import { OrderStatus } from "../../orders/types";
import OrderStatusMapper from "../../orders/mappers/orderStatusMapper";
import customizationService from "../../customizations/services/customizationService";

interface ReservationCardProps {
  index: number;
  reservation: TableReservationResponse;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export default function ReservationCard({index, reservation, onDragStart, onDragEnd}: ReservationCardProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const { updateReservationInQueue } = useTableContext();

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
  const [showPaymentProviderModal, setShowPaymentProviderModal] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState('cash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const {branchId} = useAuth();

  // Payment provider options
  const PAYMENT_PROVIDERS = [
    { id: 'cash', name: 'Cash', icon: 'mdi:cash', color: '#4CAF50' },
    { id: 'instapay', name: 'InstaPay', icon: 'mdi:credit-card-fast', color: '#2196F3' }
  ];

  useEffect(()=>{
    
    const fetchReservationOrder = async () => {
      if (reservation.reservationId) {
        const order = await tableCloudService.getReservationOrder(reservation.reservationId);
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
    setSelectedPaymentProvider(reservationOrder?.paymentProvider || 'cash');
  }, [reservationOrder]);

  async function handleSetOrderReady(){
    if(reservationOrder && reservationOrder.orderId){
      await tableCloudService.setOrdersAsReady(reservation.reservationId);
      const stringStatus = OrderStatusMapper.fromOrderStatusToString(OrderStatus.Ready);
      setReservationOrder({...reservationOrder, orderStatus: stringStatus});
      updateReservationInQueue(reservation.tableNumber, reservation.reservationId, {
        orderStatus: stringStatus
      });
    }
  }

  function handlePayOrder(){
    if(reservationOrder && reservationOrder.orderId){
      setShowPaymentProviderModal(true);
    }
  }

  async function handleConfirmPayment(){
    if(reservationOrder && reservationOrder.orderId){
      setIsProcessingPayment(true);
      try {
        // First change the payment provider
        await tableCloudService.changeReservationPayment(reservation.reservationId, selectedPaymentProvider);
        
        // Then mark as paid
        const order = await tableCloudService.payOrders(reservation.reservationId);
        printOrderInvoice(order);
        setReservationOrder({...reservationOrder, isPaid: true});
        
        // Close the modal
        setShowPaymentProviderModal(false);
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment. Please try again.');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  }

  function handleCancelPayment(){
    setShowPaymentProviderModal(false);
    setSelectedPaymentProvider('cash'); // Reset to default
  }

  async function handlePushToKitchen(){
    if(reservationOrder && reservationOrder.orderId){
      const orderItems = await tableCloudService.pushToKitchen(reservation.reservationId);
      console.log("Pushed to kitchen:", orderItems);
      printOrderItems(orderItems, reservationOrder);
      setReservationOrder({...reservationOrder, orderStatus: OrderStatusMapper.fromOrderStatusToString(OrderStatus.InProgress)});
    }
  }

  async function handlePrintOrderItems(){
    if(reservationOrder && reservationOrder.orderId && orderCustomizations){
      // Create a copy of order items with customizations assigned
      const orderItemsWithCustomizations = reservationOrder.orderItems.map(orderItem => ({
        ...orderItem,
        customizations: orderCustomizations.items[`${orderItem.itemId},${reservationOrder.orderId}`] || {}
      }));
      
      console.log("Printing order items with customizations:", orderItemsWithCustomizations);
      printOrderItems(orderItemsWithCustomizations, reservationOrder);
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
        return 'flag-checkered';
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
              await tableCloudService.confirmTableReservation(branchId!, reservation.tableNumber);
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
                  {orderItem.item.name} @ {orderItem.item.category}
                </span>
                <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto', fontWeight: 500 }}>
                  x{orderItem.quantity}
                </span>

                {/* Customizations */}
                {orderCustomizations && (
                  orderCustomizations.items[`${orderItem.itemId},${orderItem.orderId}`] && (
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
                    {Object.entries(orderCustomizations.items[`${orderItem.itemId},${orderItem.orderId}`]).map(([key, value]) => (
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

      {/* Print Order Items Button - Available when order exists */}
      {(reservationOrder?.orderId && reservationOrder.orderItems.length > 0) && (
        <div className="bg-purple-500 text-white p-3 cursor-pointer hover:bg-purple-700 transition border-b border-purple-400">
          <button className="w-full flex justify-center items-center" onClick={handlePrintOrderItems}>
            <Icon icon="mdi:printer" style={{ fontSize: 15 }} />
            <span className="ml-2">Print Order Items</span>
          </button>
        </div>
      )}

      {/* Pay Order Button */}
      {(reservation.reservationId && reservationOrder?.isPaid === false) && (
        <div className="bg-blue-500 text-white p-3 cursor-pointer hover:bg-blue-700 transition border-b border-blue-400">
          <button className="w-full flex justify-center items-center" onClick={handlePayOrder}>
            <Icon icon="mdi:currency-usd" style={{ fontSize: 15 }} />
            <span className="ml-2">Mark as Paid</span>
          </button>
        </div>
      )}

      {/* Confirm Button */}
      {(reservationOrder?.orderId && reservationOrder.orderStatus == OrderStatusMapper.fromOrderStatusToString(OrderStatus.Ready)) && (
        <div className="bg-emerald-400 text-white p-3 rounded-b-lg cursor-pointer hover:bg-emerald-600 transition">
          <button className="w-full" onClick={handleSetOrderReady}>
            <Icon icon="mdi:check" style={{ fontSize: 15, marginLeft: 5 }} />
          </button>
        </div>
      )}

      {/* Push to Kitchen Button */}
      {(reservationOrder?.orderId && reservationOrder.orderStatus == OrderStatusMapper.fromOrderStatusToString(OrderStatus.Queued)) && (
        <div className="bg-amber-400 text-white rounded-b-lg cursor-pointer hover:bg-amber-600 transition">
          <button className="w-full p-3" onClick={handlePushToKitchen}>
            <Icon icon="mdi:kitchen" style={{ fontSize: 15, marginLeft: 5 }} />
          </button>
        </div>
      )}

      {/* Payment Provider Selection Modal */}
      {showPaymentProviderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '320px',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <Icon icon="mdi:credit-card-outline" style={{ fontSize: '24px', color: '#7B1FA2' }} />
              <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600' }}>
                Select Payment Method
              </h3>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {PAYMENT_PROVIDERS.map(provider => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedPaymentProvider(provider.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: `2px solid ${selectedPaymentProvider === provider.id ? provider.color : '#e0e0e0'}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedPaymentProvider === provider.id ? `${provider.color}10` : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon 
                    icon={provider.icon} 
                    style={{ fontSize: '20px', color: provider.color }} 
                  />
                  <span style={{ 
                    fontWeight: selectedPaymentProvider === provider.id ? '600' : '500',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    {provider.name}
                  </span>
                  {selectedPaymentProvider === provider.id && (
                    <Icon 
                      icon="mdi:check-circle" 
                      style={{ fontSize: '18px', color: provider.color, marginLeft: 'auto' }} 
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCancelPayment}
                disabled={isProcessingPayment}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                  opacity: isProcessingPayment ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                style={{
                  flex: 2,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: PAYMENT_PROVIDERS.find(p => p.id === selectedPaymentProvider)?.color || '#7B1FA2',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                  opacity: isProcessingPayment ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isProcessingPayment ? (
                  <>
                    <Icon icon="mdi:loading" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon 
                      icon={PAYMENT_PROVIDERS.find(p => p.id === selectedPaymentProvider)?.icon || 'mdi:cash'} 
                      style={{ fontSize: '16px' }} 
                    />
                    Mark as Paid
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}