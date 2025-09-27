import styles from './KitchenItem.module.css';
import { useEffect, useState } from 'react';
import useAuth from '../../auth/useAuth.hook';
import { uploadService } from '../../items/services/uploadService';
import OrderItem from '../models/OrderItem';

interface KitchenItemProps {
  item: OrderItem;
  isCurrent?: boolean;
}

export function KitchenItem({ item, isCurrent }: KitchenItemProps) {
  const { token } = useAuth();
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (!item.item.imageUrl || !token) return;

      try {
        const presignedUrl = await uploadService.getViewPresignedUrl(item.item.imageUrl);
        setImageUrl(presignedUrl);
      } catch (err) {
        console.error('Error fetching presigned URL:', err);
      }
    };

    fetchPresignedUrl();
  }, [item.item.imageUrl, token]);

  return (
    <div className={`${styles.item} ${isCurrent ? styles.current : ''}`}>
      <div className={styles.itemContent}>
        {imageUrl && (
          <div className={styles.imageContainer}>
            <img 
              src={imageUrl} 
              alt={item.item.name} 
              className={styles.itemImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.header}>
            <h3 className={styles.name}>{item.item.name}</h3>
            <span className={styles.quantity}>x{item.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 