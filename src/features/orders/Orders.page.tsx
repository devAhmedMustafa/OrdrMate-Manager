import { useEffect, useState } from 'react';
import { OrderCard } from './components/OrderCard';
import { UnpaidOrders } from './components/UnpaidOrders';
import { Order, UnpaidOrder, OrderItem } from './types';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';
import { websocketService } from '../dashboard/services/websocketService';
import TakeawayOrders from './components/TakeawayOrders';

type Tab = 'orders' | 'unpaid' | 'takeaway' | string;

function Orders() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [previousTab, setPreviousTab] = useState<Tab>('orders');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [takeawayOrders, setTakeawayOrders] = useState<any[]>([]);
  const [takeawaySearch, setTakeawaySearch] = useState('');
  const [isTakeawayLoading, setIsTakeawayLoading] = useState(false);
  const { branchId, token } = useAuth();

  const fetchInitialData = async () => {
    if (!branchId || !token) return;
    
    try {
      const [orders] = await Promise.all([
        orderService.getAllOrders(branchId)
      ]);
      setAllOrders(orders);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchOrders = async () => {
    if (!branchId || !token) return;
    
    try {
      const [unpaidData, ordersData] = await Promise.all([
        orderService.getUnpaidOrders(branchId),
        orderService.getAllOrders(branchId)
      ]);
      setUnpaidOrders(unpaidData);
      setAllOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchTakeawayOrders = async () => {
    if (!branchId || !token) return;
    
    setIsTakeawayLoading(true);
    try {
      const data = await orderService.getTakeawayOrders(branchId);
      setTakeawayOrders(data || []); // Ensure it's always an array
    } catch (error) {
      console.error('Error fetching takeaway orders:', error);
      setTakeawayOrders([]); // Set empty array on error
    } finally {
      setIsTakeawayLoading(false);
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

    fetchInitialData();
    fetchOrders();
    fetchTakeawayOrders();
    const interval = setInterval(() => {
      fetchOrders();
      fetchTakeawayOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [branchId, token]);

  const handleOrderPlaced = (orderId: string, isBeingPrepared: boolean) => {
    
  };

  const handleOrderReady = (orderId: string) => {
    
    // Update all orders
    setAllOrders(prev => 
      prev.map(order => 
        order.OrderId === orderId 
          ? { ...order, Status: 'Ready' }
          : order
      )
    );
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!token) return;
    
    try {
      await orderService.markAsPaid(orderId);
      // Remove the paid order from the list
      setUnpaidOrders(prev => prev.filter(order => order.orderId !== orderId));
    } catch (error) {
      console.error('Error marking order as paid:', error);
    }
  };

  const handleRequestPickup = async (orderId: string) => {
    try {
      await orderService.requestOrderPickup(orderId);
      fetchTakeawayOrders();
    } catch (error) {
      console.error('Error requesting order pickup:', error);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setPreviousTab(activeTab);
    setActiveTab(newTab);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match this with CSS transition duration
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

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          All Orders
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'unpaid' ? styles.active : ''}`}
          onClick={() => handleTabChange('unpaid')}
        >
          Unpaid Orders
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'takeaway' ? styles.active : ''}`}
          onClick={() => handleTabChange('takeaway')}
        >
          Takeaway Orders
        </button>
        
      </div>

      <div className={styles.content}>
        {activeTab === 'orders' ? (
          <div className={`${styles.queueContent} ${activeTab === 'orders' ? styles.active : ''} ${isTransitioning && previousTab !== 'orders' ? styles.slideOut : ''}`}>
            <div className={styles.ordersList}>
              {allOrders.length === 0 ? (
                <div className={styles.emptyState}>No orders found</div>
              ) : (
                allOrders.map(order => (
                  <OrderCard 
                    key={order.OrderId} 
                    order={order} 
                  />
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'unpaid' ? (
          <div className={`${styles.queueContent} ${activeTab === 'unpaid' ? styles.active : ''} ${isTransitioning && previousTab !== 'unpaid' ? styles.slideOut : ''}`}>
            <UnpaidOrders 
              orders={unpaidOrders} 
              onMarkAsPaid={handleMarkAsPaid}
            />
          </div>
        ) : activeTab === 'takeaway' ? (
          <div className={`${styles.queueContent} ${activeTab === 'takeaway' ? styles.active : ''} ${isTransitioning && previousTab !== 'takeaway' ? styles.slideOut : ''}`}>
            <TakeawayOrders
              orders={takeawayOrders}
              search={takeawaySearch}
              onSearch={setTakeawaySearch}
              onRequestPickup={handleRequestPickup}
              onMarkAsPaid={handleMarkAsPaid}
              isLoading={isTakeawayLoading}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Orders; 