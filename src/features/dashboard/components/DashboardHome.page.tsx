import { useEffect, useState } from 'react';
import { Order } from '../../orders/types';
import { orderService } from '../../orders/services/orderService';
import { uploadService } from '../../items/services/uploadService';
import { balanceService, Balance } from '../services/balanceService';
import useAuth from '../../auth/useAuth.hook';
import styles from './DashboardHome.module.css';
import { Icon } from '@iconify/react';

export default function DashboardHome() {
  const [kitchenQueues, setKitchenQueues] = useState<Record<string, Order[]>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [balance, setBalance] = useState<Balance | null>(null);
  const { branchId, token } = useAuth();

  useEffect(() => {
    if (!branchId || !token) return;

    const fetchKitchenQueues = async () => {
      try {
        const queues = await orderService.getItemQueues(branchId);
        setKitchenQueues(queues);
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
      } catch (error) {
        console.error('Error fetching kitchen queues:', error);
      }
    };

    const fetchBalance = async () => {
      try {
        const balanceData = await balanceService.getBalance(branchId, token);
        setBalance(balanceData);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    // Initial fetch
    fetchKitchenQueues();
    fetchBalance();

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      fetchKitchenQueues();
      fetchBalance();
    }, 30000);

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

    </div>
  );
} 