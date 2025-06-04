import { useEffect, useState } from 'react';
import { KitchenQueue } from './components/KitchenQueue';
import { OrderCard } from './components/OrderCard';
import { UnpaidOrders } from './components/UnpaidOrders';
import { Order, OrderItem, OrderStatus, UnpaidOrder } from './services/orderService';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';

type Tab = 'orders' | 'unpaid' | string;

export function Orders() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [kitchenQueues, setKitchenQueues] = useState<Record<string, Order[]>>({});
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
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
    if (!branchId) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: number;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(orderService.getWebSocketUrl(branchId));

        ws.addEventListener('open', () => {
          setConnectionStatus('connected');
        });

        ws.addEventListener('message', (event) => {
          try {
            const message = JSON.parse(event.data);

            if (!message.Type) {
              return;
            }

            switch (message.Type) {
              case 'InitialData':
                handleInitialData(message.items || [], message.Orders?.orderList);
                break;
              case 'NewItem':
                handleNewItem(message.Item);
                break;
              case 'OrderPlaced':
                handleOrderPlaced(message.OrderId, message.IsBeingPrepared);
                break;
              case 'NextItem':
                handleNextItem(message.OrderId, message.Item);
                break;
              case 'OrderReady':
                handleOrderReady(message.OrderId);
                break;
            }
          } catch (e) {
            console.error('Error processing message:', e);
          }
        });

        ws.addEventListener('close', () => {
          setConnectionStatus('disconnected');
          
          reconnectTimeout = window.setTimeout(() => {
            setConnectionStatus('connecting');
            connectWebSocket();
          }, 5000);
        });

        ws.addEventListener('error', () => {
          setConnectionStatus('error');
        });

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    const handleInitialData = (items: OrderItem[], orders?: { OrderId: string; Status: OrderStatus }[]) => {
      const queues: Record<string, Order[]> = {};
      
      // First, create all orders with their correct statuses
      const orderMap = new Map<string, OrderStatus>();
      orders?.forEach(order => {
        orderMap.set(order.OrderId, order.Status);
      });
      
      items.forEach(item => {
        if (!item.KitchenName) {
          return;
        }

        // Ensure KitchenUnitId is set
        if (!item.KitchenUnitId) {
          item.KitchenUnitId = '0';
        }

        if (!queues[item.KitchenName]) {
          queues[item.KitchenName] = [];
        }

        const existingOrder = queues[item.KitchenName].find(order => order.OrderId === item.OrderId);
        if (existingOrder) {
          existingOrder.Items.push(item);
        } else {
          const status = orderMap.get(item.OrderId);
          queues[item.KitchenName].push({
            OrderId: item.OrderId,
            Items: [item],
            Status: status || OrderStatus.Pending,
            IsBeingPrepared: false
          });
        }
      });

      setKitchenQueues(queues);
    };

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

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !token) return;

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [branchId, token]);

  const allOrders = Object.values(kitchenQueues).flat();

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
          onClick={() => setActiveTab('orders')}
        >
          All Orders
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'unpaid' ? styles.active : ''}`}
          onClick={() => setActiveTab('unpaid')}
        >
          Unpaid Orders
        </button>
        {kitchenUnits.map(unitKey => {
          const [kitchenName, unitId] = unitKey.split('-');
          return (
            <button
              key={unitKey}
              className={`${styles.tab} ${activeTab === unitKey ? styles.active : ''}`}
              onClick={() => setActiveTab(unitKey)}
            >
              {kitchenName} - Unit {parseInt(unitId) + 1}
            </button>
          );
        })}
      </div>

      <div className={styles.content}>
        {activeTab === 'orders' ? (
          <div className={styles.ordersList}>
            {allOrders.map(order => (
              <OrderCard key={order.OrderId} order={order} />
            ))}
          </div>
        ) : activeTab === 'unpaid' ? (
          <UnpaidOrders 
            orders={unpaidOrders} 
            onMarkAsPaid={handleMarkAsPaid}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className={styles.kitchenQueue}>
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