import { useEffect, useState } from 'react';
import { OrderCard } from './components/OrderCard';
import { Order, UnpaidOrder, OrderItem } from './types';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';
import { websocketService } from '../dashboard/services/websocketService';

function Orders() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const { branchId, token } = useAuth();

  const fetchOrders = async () => {
    if (!branchId || !token) return;
    
    try {
      const ordersData = await orderService.getOrderQueueByBranch(branchId);
      setAllOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    // Subscribe to WebSocket status changes
    const handleStatusChange = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
      setConnectionStatus(status);
    };

    // Subscribe to WebSocket messages
    const handleMessage = (message: any) => {
      if (!message.Type) {
        return;
      }

      switch (message.Type) {
        case 'OrderPlaced':
          handleOrderPlaced(message.OrderId as string, message.IsBeingPrepared as boolean);
          break;
        case 'OrderReady':
          handleOrderReady(message.OrderId as string);
          break;
      }
    };

    websocketService.on('statusChange', handleStatusChange);
    websocketService.on('message', handleMessage);

    // Set initial status
    setConnectionStatus(websocketService.getStatus());

    return () => {
      websocketService.off('statusChange', handleStatusChange);
      websocketService.off('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!branchId || !token) return;

    fetchOrders();
    // fetchTakeawayOrders();
    const interval = setInterval(() => {
      fetchOrders();
      // fetchTakeawayOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [branchId, token]);

  const handleOrderPlaced = (orderId: string, isBeingPrepared: boolean) => {
    
  };

  const handleOrderReady = (orderId: string) => {
    
    // Update all orders
    setAllOrders(prev => 
      prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'Ready' }
          : order
      )
    );
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!token) return;
    
    try {
      await orderService.markAsPaid(orderId);
    } catch (error) {
      console.error('Error marking order as paid:', error);
    }
  };

  const handleRequestPickup = async (orderId: string) => {
    try {
      await orderService.requestOrderPickup(orderId);
      // fetchTakeawayOrders();
    } catch (error) {
      console.error('Error requesting order pickup:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders</h1>
        <div 
          className={styles.status}
          style={{ 
            backgroundColor: 
              connectionStatus === 'connected' ? '#4CAF50' :
              connectionStatus === 'connecting' ? '#FFC107' :
              connectionStatus === 'error' ? '#F44336' : '#9E9E9E'
          }}
        >
          {connectionStatus.toUpperCase()}
        </div>
      </div>

      <div className={styles.content}>
        
        <div className={`${styles.queueContent}`}>
          <div className={styles.ordersList}>
            {allOrders.length === 0 ? (
              <div className={styles.emptyState}>No orders found</div>
            ) : (
              allOrders.map(order => (
                <OrderCard
                  key={order.orderId} 
                  order={order} 
                />
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Orders; 