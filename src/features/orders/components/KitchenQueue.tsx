import { KitchenQueue as KitchenQueueType } from '../types';
import { KitchenItem } from './KitchenItem';
import styles from './KitchenQueue.module.css';
import useAuth from '../../auth/useAuth.hook';
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import OrderResponse from '../dtos/OrderResponse';

interface KitchenQueueProps {
  queue: KitchenQueueType;
  kitchenUnitId: string;
  onItemMarkedAsDone?: (dequedItemId: string) => void;
}

export function KitchenQueue({ queue, kitchenUnitId, onItemMarkedAsDone }: KitchenQueueProps) {
  const { branchId, token } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [localItems, setLocalItems] = useState<OrderResponse['orderItems']>([]);
  
  // Get all items for this kitchen unit
  const allItems = queue.Orders.reduce((items: any[], order) => {
    const orderItems = order.orderItems.filter(item => 
      String(item.item.kitchenId) === String(kitchenUnitId)
    );
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
      const response = await orderService.checkItemAsPrepared(
        branchId,
        queue.KitchenName,
        currentItem.item.kitchenId,
        token
      );
      
      // Wait for the response before updating the queue
      if (response.dequedItemId === currentItem.itemId) {
        // Remove the current item from the queue
        setLocalItems(prev => prev.filter(item => item.itemId !== currentItem.itemId));
        // Notify parent component
        onItemMarkedAsDone?.(response.dequedItemId);
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