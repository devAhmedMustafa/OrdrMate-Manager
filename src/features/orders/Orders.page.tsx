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
  const [allOrders, setAllOrders] = useState<Order[]>([]);
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
      const [queues, orders] = await Promise.all([
        orderService.getItemQueues(branchId),
        orderService.getAllOrders(branchId)
      ]);
      setKitchenQueues(queues);
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
    if (!item.KitchenName) {
      return;
    }

    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      if (!newQueues[item.KitchenName]) {
        newQueues[item.KitchenName] = [];
      }

      const existingOrder = newQueues[item.KitchenName].find(order => order.OrderId === item.OrderId);
      if (existingOrder) {
        newQueues[item.KitchenName] = newQueues[item.KitchenName].map(order => 
          order.OrderId === item.OrderId 
            ? { ...order, Items: [...order.Items, item] }
            : order
        );
      } else {
        newQueues[item.KitchenName] = [
          ...newQueues[item.KitchenName],
          {
            OrderId: item.OrderId,
            Items: [item],
            Status: 'Pending',
            IsBeingPrepared: false
          }
        ];
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
    // Update kitchen queues
    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      
      Object.keys(newQueues).forEach(kitchenName => {
        const orderIndex = newQueues[kitchenName].findIndex(o => o.OrderId === orderId);
        if (orderIndex !== -1) {
          newQueues[kitchenName][orderIndex].Status = 'Ready';
          newQueues[kitchenName].splice(orderIndex, 1);
        }
      });
      
      return newQueues;
    });

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

  const handleItemMarkedAsDone = (dequedItemId: string) => {
    setKitchenQueues(prev => {
      const newQueues = { ...prev };
      Object.keys(newQueues).forEach(kitchenName => {
        newQueues[kitchenName] = newQueues[kitchenName].map(order => ({
          ...order,
          Items: order.Items.filter(item => item.ItemId !== dequedItemId)
        })).filter(order => order.Items.length > 0);
      });
      return newQueues;
    });
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
            // Use a Map to ensure unique units per kitchen
            const unitMap = new Map<string, boolean>();
            kitchenQueues[kitchenName].forEach(order => {
              order.Items.forEach(item => {
                const unitId = item.KitchenUnitId || '0';
                unitMap.set(unitId, true);
              });
            });
            const units = Array.from(unitMap.keys());
            
            return (
              <div key={kitchenName} className={styles.kitchenTabGroup}>
                <button
                  className={`${styles.kitchenTab} ${units.some(unitId => activeTab === `${kitchenName}-${unitId}`) ? styles.active : ''}`}
                  onClick={() => handleTabChange(`${kitchenName}-${units[0]}`)}
                >
                  {kitchenName}
                </button>
                <div className={styles.unitButtons}>
                  {units.map(unitId => (
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
              const queueData = {
                KitchenName: kitchenName,
                Orders: kitchenQueues[kitchenName] || [],
                NextItem: kitchenQueues[kitchenName]?.find(o => 
                  o.NextItem?.KitchenUnitId === unitId
                )?.NextItem
              };
              return (
                <KitchenQueue
                  queue={queueData}
                  kitchenUnitId={unitId}
                  onItemMarkedAsDone={handleItemMarkedAsDone}
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