import { KitchenQueue as KitchenQueueType, Order } from '../types';
import { KitchenItem } from './KitchenItem';
import styles from './KitchenQueue.module.css';
import useAuth from '../../auth/useAuth.hook';
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

interface KitchenQueueProps {
  queue: KitchenQueueType;
  kitchenUnitId: string;
}

export function KitchenQueue({ queue, kitchenUnitId }: KitchenQueueProps) {
  const { branchId, token } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [localItems, setLocalItems] = useState<Order['Items']>([]);
  
  // Get all items for this kitchen unit
  const allItems = queue.Orders.reduce((items: any[], order) => {
    const orderItems = order.Items.filter(item => item.KitchenUnitId === kitchenUnitId);
    return [...items, ...orderItems];
  }, []);
  
  // Use localItems if available, otherwise use allItems
  const currentItem = localItems[0] || allItems[0];
  const remainingItems = localItems.length > 0 ? localItems.slice(1) : allItems.slice(1);

  // Reset local items when queue changes
  useEffect(() => {
    setLocalItems([]);
  }, [queue]);

  const handleMarkAsDone = async () => {
    if (!currentItem || !branchId || !token || isAnimating) return;

    setIsAnimating(true);
    try {
      await orderService.markItemAsPrepared(
        branchId,
        queue.KitchenName,
        currentItem.KitchenUnitId,
      );
      
      // Only update local items if there are remaining items
      if (remainingItems.length > 0) {
        setLocalItems(remainingItems);
      } else {
        setLocalItems([]);
      }
      
      // Reset animation state after a short delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this with the animation duration
    } catch (error) {
      console.error('Error marking item as done:', error);
      setIsAnimating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{queue.KitchenName} - Unit {parseInt(kitchenUnitId) + 1}</h2>
      </div>

      {currentItem ? (
        <div className={`${styles.currentItem} ${isAnimating ? styles.slideOut : ''}`}>
          <div className={styles.currentItemHeader}>
            <span className={styles.currentItemLabel}>Now Preparing</span>
            <span className={styles.currentItemTimer}>00:00</span>
          </div>
          <KitchenItem item={currentItem} isCurrent />
          <button 
            className={styles.markDoneButton}
            onClick={handleMarkAsDone}
            disabled={isAnimating}
          >
            Mark as Done
          </button>
        </div>
      ) : (
        <div className={styles.noItems}>
          <p>No items in queue</p>
        </div>
      )}

      {remainingItems.length > 0 && (
        <div className={styles.queueSection}>
          <h3>Queue</h3>
          <div className={styles.items}>
            {remainingItems.map((item, index) => (
              <div 
                key={`${item.OrderId}-${item.ItemId}-${index}`}
                className={isAnimating && index === 0 ? styles.slideUp : ''}
              >
                <KitchenItem item={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 