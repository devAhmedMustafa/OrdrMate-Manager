import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../orders/types';
import { TableReservation, Table } from '../../tables/services/tableService';
import { orderService } from '../../orders/services/orderService';
import { tableService } from '../../tables/services/tableService';
import { uploadService } from '../../items/services/uploadService';
import { balanceService, Balance } from '../services/balanceService';
import useAuth from '../../auth/useAuth.hook';
import styles from './DashboardHome.module.css';
import { Icon } from '@iconify/react';

export default function DashboardHome() {
  const [kitchenQueues, setKitchenQueues] = useState<Record<string, Order[]>>({});
  const [tableQueues, setTableQueues] = useState<Record<number, TableReservation[]>>({});
  const [tables, setTables] = useState<Table[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [balance, setBalance] = useState<Balance | null>(null);
  const { branchId, token } = useAuth();

  useEffect(() => {
    if (!branchId || !token) return;

    const fetchData = async () => {
      try {
        // Fetch kitchen queues and tables in parallel
        const [queues, tablesData] = await Promise.all([
          orderService.getItemQueues(branchId),
          tableService.getTables(branchId)
        ]);
        
        setKitchenQueues(queues);
        setTables(tablesData);
        
        // Fetch queue for each table
        const tableQueuesData: Record<number, TableReservation[]> = {};
        for (const table of tablesData) {
          try {
            const queue = await tableService.getTableQueue(branchId, table.tableNumber);
            tableQueuesData[table.tableNumber] = queue;
          } catch (error) {
            console.error(`Error fetching queue for table ${table.tableNumber}:`, error);
            tableQueuesData[table.tableNumber] = [];
          }
        }
        setTableQueues(tableQueuesData);

        // Get presigned URLs for all item images
        const urls: Record<string, string> = {};
        for (const orders of Object.values(queues)) {
          for (const order of orders) {
            for (const item of order.Items) {
              if (item.ImageUrl && !urls[item.ImageUrl]) {
                try {
                  const presignedUrl = await uploadService.getViewPresignedUrl(item.ImageUrl);
                  urls[item.ImageUrl] = presignedUrl;
                } catch (error) {
                  console.error('Error fetching presigned URL:', error);
                }
              }
            }
          }
        }
        setImageUrls(urls);

        // Fetch balance separately to not block other data
        try {
          const balanceData = await balanceService.getBalance(branchId, token);
          setBalance(balanceData);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [branchId, token]);

  const handleMarkAsDone = async (kitchenName: string, kitchenUnitId: string) => {
    if (!branchId || !token) return;

    try {
      await orderService.markItemAsPrepared(branchId, kitchenName, kitchenUnitId);
      // Refresh data after marking as done
      const queues = await orderService.getItemQueues(branchId);
      setKitchenQueues(queues);
    } catch (error) {
      console.error('Error marking item as done:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon="mdi:cash-multiple" className={styles.sectionIcon} />
          Balance
        </h2>
        <div className={styles.balanceGrid}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceHeader}>
              <Icon icon="mdi:cash" className={styles.balanceIcon} />
              <span>Total Earnings</span>
            </div>
            <div className={styles.balanceAmount}>
              ${balance?.totalEarnings.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className={styles.balanceCard}>
            <div className={styles.balanceHeader}>
              <Icon icon="mdi:cash-clock" className={styles.balanceIcon} />
              <span>Today's Earnings</span>
            </div>
            <div className={styles.balanceAmount}>
              ${balance?.todayEarnings.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon="mdi:kitchen" className={styles.sectionIcon} />
          Kitchen Queues
        </h2>
        <div className={styles.grid}>
          {Object.entries(kitchenQueues).map(([kitchenName, orders]) => {
            // Get all items for this kitchen
            const allItems = orders.reduce((items: any[], order) => {
              return [...items, ...order.Items];
            }, []);

            // Group items by kitchen unit
            const itemsByUnit = allItems.reduce((acc: Record<string, any[]>, item) => {
              const unitId = item.KitchenUnitId || '0';
              if (!acc[unitId]) {
                acc[unitId] = [];
              }
              acc[unitId].push(item);
              return acc;
            }, {});

            return Object.entries(itemsByUnit).map(([unitId, items]) => {
              const currentItem = items[0];
              return (
                <div key={`${kitchenName}-${unitId}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.kitchenInfo}>
                      <h3>{kitchenName}</h3>
                      <span className={styles.unitBadge}>Unit {parseInt(unitId) + 1}</span>
                    </div>
                    <span className={styles.queueCount}>{items.length} items</span>
                  </div>
                  {currentItem ? (
                    <div className={styles.currentItem}>
                      <div className={styles.itemImage}>
                        {currentItem.ImageUrl ? (
                          <img 
                            src={imageUrls[currentItem.ImageUrl]} 
                            alt={currentItem.ItemName}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className={styles.placeholderImage}>
                            <Icon icon="mdi:food" />
                          </div>
                        )}
                      </div>
                      <div className={styles.itemDetails}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>
                            {currentItem.ItemName}
                            <span className={styles.quantity}>x{currentItem.Quantity}</span>
                          </span>
                          {currentItem.Notes && (
                            <span className={styles.notes}>{currentItem.Notes}</span>
                          )}
                        </div>
                        <button
                          className={styles.markDoneButton}
                          onClick={() => handleMarkAsDone(kitchenName, unitId)}
                          title="Mark as Ready"
                        >
                          <Icon icon="mdi:check-circle" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noItems}>
                      <Icon icon="mdi:check-circle" />
                      <span>No items in queue</span>
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon="mdi:table" className={styles.sectionIcon} />
          Table Queues
        </h2>
        <div className={styles.grid}>
          {Object.entries(tableQueues).map(([tableNumber, reservations]) => {
            const currentReservation = reservations[0];
            return (
              <div key={tableNumber} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.tableInfo}>
                    <h3>Table {tableNumber}</h3>
                    <span className={styles.tableStatus}>Active</span>
                  </div>
                  <span className={styles.queueCount}>{reservations.length} reservations</span>
                </div>
                {currentReservation ? (
                  <div className={styles.currentItem}>
                    <div className={styles.reservationDetails}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{currentReservation.customerName}</span>
                        <span className={styles.orderId}>
                          {new Date(currentReservation.reservationDate).toLocaleTimeString()}
                        </span>
                        <span className={styles.guests}>
                          <Icon icon="mdi:account-group" />
                          {tables.find(t => t.tableNumber === parseInt(tableNumber))?.seats || 0} seats
                        </span>
                      </div>
                      <button
                        className={styles.markDoneButton}
                        onClick={() => {/* TODO: Implement mark table as done */}}
                        title="Mark as Ready"
                      >
                        <Icon icon="mdi:check-circle" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noItems}>
                    <Icon icon="mdi:check-circle" />
                    <span>No reservations</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 