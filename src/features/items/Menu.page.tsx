import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../auth/useAuth.hook';
import axios from 'axios';
import styles from './Menu.module.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  preparationTime: number;
  category: string;
}

export default function MenuPage() {
  const { restaurantId, token } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchItems = async () => {
      if (!restaurantId) return;

      try {
        const response = await axios.get(
          `http://localhost:5126/api/Item/restaurant/${restaurantId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setItems(response.data);
      } catch (err) {
        setError('Failed to load menu items');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurantId, token]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  if (loading) {
    return <div className={styles.loading}>Loading menu items...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Menu Items</h1>
      
      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.categoryButtonActive : ''
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <Link to={`/menu/${item.id}`} key={item.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <h2 className={styles.itemName}>{item.name}</h2>
              <p className={styles.description}>{item.description}</p>
              <div className={styles.details}>
                <span className={styles.price}>${item.price.toFixed(2)}</span>
                <span className={styles.category}>{item.category}</span>
                {item.preparationTime > 0 && (
                  <span className={styles.prepTime}>{item.preparationTime} min</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 