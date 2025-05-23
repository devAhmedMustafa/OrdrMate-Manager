import { useEffect, useState } from 'react';
import useAuth from '../../auth/useAuth.hook';
import axios from 'axios';
import styles from './RestaurantHeader.module.css';

interface Restaurant {
  id: string;
  name: string;
}

export function RestaurantHeader() {
  const { restaurantId, token } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;

      try {
        const response = await axios.get(`http://localhost:5126/api/Restaurant/${restaurantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRestaurant(response.data);
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