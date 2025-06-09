import React, { useEffect, useState } from 'react';
import { KitchenQueue } from './components/KitchenQueue';
import { OrderCard } from './components/OrderCard';
import { UnpaidOrders } from './components/UnpaidOrders';
import { Order, OrderStatus, UnpaidOrder, OrderItem } from './types';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';
import { websocketService } from '../dashboard/services/websocketService';

type Tab = 'orders' | 'unpaid' | string;

function Orders() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [kitchenQueues, setKitchenQueues] = useState<Record<string, Order[]>>({});
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [previousTab, setPreviousTab] = useState<Tab>('orders');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { branchId, token } = useAuth();

  // Get unique kitchen units from all orders
  const kitchenUnits = Object.entries(kitchenQueues).reduce((acc, [kitchenName, orders]) => {
    const units = new Set<string>();
    orders.forEach(order => {
      order.Items.forEach(item => {
        // Add a default unit if KitchenUnitId is not present
        const unitId = item.KitchenUnitId || '0';
        units.add(`${kitchenName}-${unitId}`);
      });
    });
    return [...acc, ...Array.from(units)];
  }, [] as string[]);

  const fetchInitialData = async () => {
    if (!branchId || !token) return;
    
    try {
      const queues = await orderService.getItemQueues(branchId);
      setKitchenQueues(queues);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchOrders = async () => {
    if (!branchId || !token) return;
    
    try {
      const data = await orderService.getUnpaidOrders(branchId);
      setUnpaidOrders(data);
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
        case 'NewItem':
          handleNewItem(message.Item as OrderItem);
          break;
        case 'OrderPlaced':
          handleOrderPlaced(message.OrderId as string, message.IsBeingPrepared as boolean);
          break;
        case 'NextItem':
          handleNextItem(message.OrderId as string, message.Item as OrderItem);
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
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [branchId, token]);

  const handleNewItem = (item: OrderItem) => {
    if (!item.KitchenName) return;

    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      if (!newQueues[item.KitchenName]) {
        newQueues[item.KitchenName] = [];
      }

      const existingOrder = newQueues[item.KitchenName].find(order => order.OrderId === item.OrderId);
      if (existingOrder) {
        existingOrder.Items.push(item);
      } else {
        newQueues[item.KitchenName].push({
          OrderId: item.OrderId,
          Items: [item],
          Status: OrderStatus.Pending,
          IsBeingPrepared: false
        });
      }

      return newQueues;
    });
  };

  const handleOrderPlaced = (orderId: string, isBeingPrepared: boolean) => {
    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      Object.keys(newQueues).forEach(kitchenName => {
        const order = newQueues[kitchenName].find(o => o.OrderId === orderId);
        if (order) {
          order.IsBeingPrepared = isBeingPrepared;
        }
      });
      return newQueues;
    });
  };

  const handleNextItem = (orderId: string, nextItem: OrderItem) => {
    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      Object.keys(newQueues).forEach(kitchenName => {
        const order = newQueues[kitchenName].find(o => o.OrderId === orderId);
        if (order) {
          order.NextItem = nextItem;
        }
      });
      return newQueues;
    });
  };

  const handleOrderReady = (orderId: string) => {
    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      
      Object.keys(newQueues).forEach(kitchenName => {
        const orderIndex = newQueues[kitchenName].findIndex(o => o.OrderId === orderId);
        if (orderIndex !== -1) {
          newQueues[kitchenName][orderIndex].Status = OrderStatus.Ready;
          newQueues[kitchenName].splice(orderIndex, 1);
        }
      });
      
      return newQueues;
    });
  };

  // Create a Map to deduplicate orders
  const orderMap = new Map<string, Order>();
  Object.values(kitchenQueues).forEach(orders => {
    orders.forEach(order => {
      if (!orderMap.has(order.OrderId)) {
        orderMap.set(order.OrderId, order);
      }
    });
  });
  const allOrders = Array.from(orderMap.values());

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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!token) return;
    
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
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
        <div className={styles.kitchenTabs}>
          {Object.keys(kitchenQueues).map(kitchenName => {
            const units = new Set<string>();
            kitchenQueues[kitchenName].forEach(order => {
              order.Items.forEach(item => {
                units.add(item.KitchenUnitId || '0');
              });
            });
            return (
              <div key={kitchenName} className={styles.kitchenTabGroup}>
                <button
                  className={`${styles.kitchenTab} ${Array.from(units).some(unitId => activeTab === `${kitchenName}-${unitId}`) ? styles.active : ''}`}
                  onClick={() => handleTabChange(`${kitchenName}-${Array.from(units)[0]}`)}
                >
                  {kitchenName}
                </button>
                <div className={styles.unitButtons}>
                  {Array.from(units).map(unitId => (
                    <button
                      key={`${kitchenName}-${unitId}`}
                      className={`${styles.unitButton} ${activeTab === `${kitchenName}-${unitId}` ? styles.active : ''}`}
                      onClick={() => handleTabChange(`${kitchenName}-${unitId}`)}
                    >
                      Unit {parseInt(unitId) + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
        ) : (
          <div className={`${styles.queueContent} ${activeTab.startsWith(activeTab.split('-')[0]) ? styles.active : ''} ${isTransitioning && !previousTab.startsWith(activeTab.split('-')[0]) ? styles.slideOut : ''}`}>
            {(() => {
              const [kitchenName, unitId] = activeTab.split('-');
              return (
                <KitchenQueue
                  queue={{
                    KitchenName: kitchenName,
                    Orders: kitchenQueues[kitchenName] || [],
                    NextItem: kitchenQueues[kitchenName]?.find(o => 
                      o.NextItem?.KitchenUnitId === unitId
                    )?.NextItem
                  }}
                  kitchenUnitId={unitId}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders; 