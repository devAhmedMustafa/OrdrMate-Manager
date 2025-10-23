import { useEffect, useState, useMemo } from 'react';
// import { KitchenQueue } from './components/KitchenQueue';
import { OrderCard } from './components/OrderCard';
import { UnpaidOrders } from './components/UnpaidOrders';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';
import { websocketService } from '../dashboard/services/websocketService';
import TakeawayOrders from './components/TakeawayOrders';
import OrderResponse from './dtos/OrderResponse';
import { printOrderInvoice } from './utils/printOrder';
// import OrderItem from './models/OrderItem';

type Tab = 'orders' | 'unpaid' | 'takeaway' | string;

interface OrderFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  orderType: string;
  isPaid: string;
}

function Orders() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  // const [kitchenQueues, setKitchenQueues] = useState<Record<string, Order[]>>({});
  const [unpaidOrders, setUnpaidOrders] = useState<OrderResponse[]>([]);
  const [allOrders, setAllOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [previousTab, setPreviousTab] = useState<Tab>('orders');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [takeawayOrders, setTakeawayOrders] = useState<any[]>([]);
  const [takeawaySearch, setTakeawaySearch] = useState('');
  const [isTakeawayLoading, setIsTakeawayLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(() => {
    // Load saved filters from localStorage
    try {
      const saved = localStorage.getItem('orderFilters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    return {
      dateFrom: '',
      dateTo: '',
      status: '',
      orderType: '',
      isPaid: ''
    };
  });
  const [showFilters, setShowFilters] = useState(false);
  const { branchId, token } = useAuth();

  const fetchInitialData = async () => {
    if (!branchId || !token) return;
    
    try {
      const orders = await orderService.getAllOrders(branchId)
      // setKitchenQueues(queues);
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
        case 'NewItem':
          // handleNewItem(message.Item as OrderItem);
          break;
        case 'OrderPlaced':
          // handleOrderPlaced(message.OrderId as string, message.IsBeingPrepared as boolean);
          break;
        case 'NextItem':
          // handleNextItem(message.OrderId as string, message.Item as OrderItem);
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



  // const handleNewItem = (item: OrderItem) => {
    // if (!item.KitchenName) {
    //   return;
    // }

    // setKitchenQueues(prev => {
    //   const newQueues = { ...prev };
    //   if (!newQueues[item.KitchenName]) {
    //     newQueues[item.KitchenName] = [];
    //   }

    //   const existingOrder = newQueues[item.KitchenName].find(order => order.OrderId === item.OrderId);
    //   if (existingOrder) {
    //     newQueues[item.KitchenName] = newQueues[item.KitchenName].map(order => 
    //       order.OrderId === item.OrderId 
    //         ? { ...order, Items: [...order.Items, item] }
    //         : order
    //     );
    //   } else {
    //     newQueues[item.KitchenName] = [
    //       ...newQueues[item.KitchenName],
    //       {
    //         OrderId: item.OrderId,
    //         Items: [item],
    //         Status: 'Pending',
    //         IsBeingPrepared: false
    //       }
    //     ];
    //   }

    //   return newQueues;
    // });
  // };

  // const handleOrderPlaced = (orderId: string, isBeingPrepared: boolean) => {
    // setKitchenQueues(prev => {
    //   const newQueues = { ...prev };
    //   Object.keys(newQueues).forEach(kitchenName => {
    //     const order = newQueues[kitchenName].find(o => o.OrderId === orderId);
    //     if (order) {
    //       order.IsBeingPrepared = isBeingPrepared;
    //     }
    //   });
    //   return newQueues;
    // });
  // };

  // const handleNextItem = (orderId: string, nextItem: OrderItem) => {
    // setKitchenQueues(prev => {
    //   const newQueues = { ...prev };
    //   Object.keys(newQueues).forEach(kitchenName => {
    //     const order = newQueues[kitchenName].find(o => o.OrderId === orderId);
    //     if (order) {
    //       order.NextItem = nextItem;
    //     }
    //   });
    //   return newQueues;
    // });
  // };

  const handleOrderReady = (orderId: string) => {
    // Update kitchen queues
    // setKitchenQueues(prev => {
    //   const newQueues = { ...prev };
      
    //   Object.keys(newQueues).forEach(kitchenName => {
    //     const orderIndex = newQueues[kitchenName].findIndex(o => o.OrderId === orderId);
    //     if (orderIndex !== -1) {
    //       newQueues[kitchenName][orderIndex].Status = 'Ready';
    //       newQueues[kitchenName].splice(orderIndex, 1);
    //     }
    //   });
      
    //   return newQueues;
    // });

    // Update all orders
    setAllOrders(prev => 
      prev.map(order => 
        order.orderId === orderId 
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
      printOrderInvoice(allOrders.find(o => o.orderId === orderId) as OrderResponse);
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

  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(order => {
        const orderDate = order.orderDate;
        if (!orderDate) return false;
        try {
          const date = new Date(orderDate);
          const fromDate = new Date(filters.dateFrom);
          return date >= fromDate;
        } catch {
          return false;
        }
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(order => {
        const orderDate = order.orderDate;
        if (!orderDate) return false;
        try {
          const date = new Date(orderDate);
          const toDate = new Date(filters.dateTo);
          // Set time to end of day for "to" date
          toDate.setHours(23, 59, 59, 999);
          return date <= toDate;
        } catch {
          return false;
        }
      });
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(order => 
        order.orderStatus && order.orderStatus.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by order type
    if (filters.orderType) {
      filtered = filtered.filter(order => 
        order.orderType && order.orderType.toLowerCase() === filters.orderType.toLowerCase()
      );
    }

    // Filter by payment status
    if (filters.isPaid) {
      const isPaidFilter = filters.isPaid === 'paid';
      filtered = filtered.filter(order => {
        // Handle cases where IsPaid might be undefined
        if (order.isPaid === undefined || order.isPaid === null) {
          return !isPaidFilter; // Treat undefined/null as unpaid
        }
        return order.isPaid === isPaidFilter;
      });
    }

    return filtered;
  }, [allOrders, filters]);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Save to localStorage
      try {
        localStorage.setItem('orderFilters', JSON.stringify(newFilters));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
      return newFilters;
    });
  };

  const resetFilters = () => {
    const emptyFilters = {
      dateFrom: '',
      dateTo: '',
      status: '',
      orderType: '',
      isPaid: ''
    };
    setFilters(emptyFilters);
    // Clear from localStorage
    try {
      localStorage.setItem('orderFilters', JSON.stringify(emptyFilters));
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const getUniqueValues = (key: 'orderStatus' | 'orderType') => {
    const values = allOrders.map(order => order[key]).filter(Boolean);
    return [...new Set(values)];
  };

  // Keyboard shortcuts for filtering
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger shortcuts when on orders tab and not typing in inputs
      if (activeTab !== 'orders' || 
          event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLSelectElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'f':
            event.preventDefault();
            setShowFilters(!showFilters);
            break;
          case 'r':
            event.preventDefault();
            resetFilters();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeTab, showFilters, resetFilters]);

  // const handleItemMarkedAsDone = (dequedItemId: string) => {
  //   setKitchenQueues(prev => {
  //     const newQueues = { ...prev };
  //     Object.keys(newQueues).forEach(kitchenName => {
  //       newQueues[kitchenName] = newQueues[kitchenName].map(order => ({
  //         ...order,
  //         Items: order.Items.filter(item => item.ItemId !== dequedItemId)
  //       })).filter(order => order.Items.length > 0);
  //     });
  //     return newQueues;
  //   });
  // };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders</h1>
        <div className={styles.headerActions}>
          {activeTab === 'orders' && (
            <button 
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
              title={`${showFilters ? 'Hide' : 'Show'} Filters (Ctrl+F)`}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
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
      </div>

      {showFilters && activeTab === 'orders' && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label>From Date:</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label>To Date:</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={styles.filterInput}
              >
                <option value="">All Statuses</option>
                {getUniqueValues('orderStatus').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Order Type:</label>
              <select
                value={filters.orderType}
                onChange={(e) => handleFilterChange('orderType', e.target.value)}
                className={styles.filterInput}
              >
                <option value="">All Types</option>
                {getUniqueValues('orderType').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Payment Status:</label>
              <select
                value={filters.isPaid}
                onChange={(e) => handleFilterChange('isPaid', e.target.value)}
                className={styles.filterInput}
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            
            <div className={styles.filterActions}>
              <button 
                onClick={resetFilters}
                className={styles.resetButton}
                title="Reset All Filters (Ctrl+R)"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={styles.filterSummary}>
          <span className={styles.resultCount}>
            {filteredOrders.length} of {allOrders.length} orders
          </span>
          {(filters.dateFrom || filters.dateTo || filters.status || filters.orderType || filters.isPaid) && (
            <div className={styles.activeFilters}>
              {filters.dateFrom && (
                <span className={styles.filterTag}>
                  From: {new Date(filters.dateFrom).toLocaleDateString()}
                  <button 
                    onClick={() => handleFilterChange('dateFrom', '')}
                    className={styles.removeFilter}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.dateTo && (
                <span className={styles.filterTag}>
                  To: {new Date(filters.dateTo).toLocaleDateString()}
                  <button 
                    onClick={() => handleFilterChange('dateTo', '')}
                    className={styles.removeFilter}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className={styles.filterTag}>
                  Status: {filters.status}
                  <button 
                    onClick={() => handleFilterChange('status', '')}
                    className={styles.removeFilter}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.orderType && (
                <span className={styles.filterTag}>
                  Type: {filters.orderType}
                  <button 
                    onClick={() => handleFilterChange('orderType', '')}
                    className={styles.removeFilter}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.isPaid && (
                <span className={styles.filterTag}>
                  Payment: {filters.isPaid === 'paid' ? 'Paid' : 'Unpaid'}
                  <button 
                    onClick={() => handleFilterChange('isPaid', '')}
                    className={styles.removeFilter}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

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
        <div className={styles.kitchenTabs}>
          {/* {Object.keys(kitchenQueues).map(kitchenName => {
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
          })} */}
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'orders' ? (
          <div className={`${styles.queueContent} ${activeTab === 'orders' ? styles.active : ''} ${isTransitioning && previousTab !== 'orders' ? styles.slideOut : ''}`}>
            <div className={styles.ordersList}>
              {filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  {allOrders.length === 0 ? 'No orders found' : 'No orders match the current filters'}
                </div>
              ) : (
                filteredOrders.map(order => (
                  <OrderCard 
                    key={order.orderId} 
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
        ) : (
          <div className={`${styles.queueContent} ${activeTab.startsWith(activeTab.split('-')[0]) ? styles.active : ''} ${isTransitioning && !previousTab.startsWith(activeTab.split('-')[0]) ? styles.slideOut : ''}`}>
            {/* {(() => {
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
            })()} */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders; 