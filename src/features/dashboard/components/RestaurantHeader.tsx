import { useEffect, useState } from 'react';
import useAuth from '../../auth/useAuth.hook';
import styles from './RestaurantHeader.module.css';
import { restaurantService, Restaurant } from '../services/restaurantService';

export function RestaurantHeader() {
  const { restaurantId, token } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId || !token) return;

      try {
        const data = await restaurantService.getRestaurant(restaurantId);
        setRestaurant(data);
      } catch (err) {
        setError('Failed to load restaurant information');
        console.error('Error fetching restaurant:', err);
      }
    };

    fetchRestaurant();
  }, [restaurantId, token]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <header className={styles.header}>
      <div className={styles.restaurantName}>
        {restaurant?.name || 'Loading...'}
      </div>
    </header>
  );
} 