import { useEffect, useState } from 'react';
import { OrderCard } from './components/OrderCard';
import { Order } from './types';
import styles from './Orders.module.css';
import useAuth from '../auth/useAuth.hook';
import { orderService } from './services/orderService';

interface FilterOptions {
  status: string;
  dateRange: string;
  orderType: string;
  searchTerm: string;
}

function Orders() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    orderType: 'all',
    searchTerm: ''
  });
  const { branchId, token } = useAuth();

  const fetchAllOrders = async () => {
    if (!branchId || !token) return;
    
    setLoading(true);
    try {
      const ordersData = await orderService.getAllOrders(branchId);
      setAllOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [branchId, token]);

  // Apply filters whenever filters or allOrders change
  useEffect(() => {
    let filtered = [...allOrders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === filters.status);
    }

    // Filter by order type
    if (filters.orderType !== 'all') {
      filtered = filtered.filter(order => order.orderType === filters.orderType);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate >= filterDate;
      });
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customer?.toLowerCase().includes(searchLower) ||
        order.orderItems.some(item => 
          item.item.name.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredOrders(filtered);
  }, [filters, allOrders]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getOrderStats = () => {
    const total = allOrders.length;
    const pending = allOrders.filter(order => order.orderStatus === 'Pending').length;
    const inProgress = allOrders.filter(order => order.orderStatus === 'InProgress').length;
    const completed = allOrders.filter(order => order.orderStatus === 'Delivered').length;
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + (order.totalAmount || 0), 0
    );

    return { total, pending, inProgress, completed, totalRevenue };
  };

  const stats = getOrderStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Orders Analytics</h1>
        <button onClick={fetchAllOrders} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Orders</h3>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <h3>Pending</h3>
          <span className={styles.statValue}>{stats.pending}</span>
        </div>
        <div className={styles.statCard}>
          <h3>In Progress</h3>
          <span className={styles.statValue}>{stats.inProgress}</span>
        </div>
        <div className={styles.statCard}>
          <h3>Completed</h3>
          <span className={styles.statValue}>{stats.completed}</span>
        </div>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <span className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersTitle}>🔎 Filter Orders</div>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Queued">Queued</option>
              <option value="InProgress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Date Range</label>
            <select 
              value={filters.dateRange} 
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Order Type</label>
            <select 
              value={filters.orderType} 
              onChange={(e) => handleFilterChange('orderType', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="Dine-in">Dine-in</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Search</label>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search orders, customers, items..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className={styles.resultsInfo}>
        <span>Showing {filteredOrders.length} of {allOrders.length} orders</span>
      </div>

      {/* Orders List */}
      <div className={styles.ordersContainer}>
        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            {allOrders.length === 0 ? 'No orders found' : 'No orders match your filters'}
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map(order => (
              <OrderCard
                key={order.orderId} 
                order={order}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;