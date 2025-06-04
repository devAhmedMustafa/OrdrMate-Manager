import { useEffect, useState, useMemo } from 'react';
import useAuth from '../auth/useAuth.hook';
import styles from './Menu.module.css';
import { itemService, MenuItem } from './services/itemService';
import { uploadService } from './services/uploadService';

interface MenuItemWithPresignedUrl extends MenuItem {
  presignedUrl: string;
}

export default function BranchMenuPage() {
  const { restaurantId, token } = useAuth();
  const [items, setItems] = useState<MenuItemWithPresignedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchItems = async () => {
      if (!restaurantId || !token) return;

      try {
        const items = await itemService.getRestaurantItems(restaurantId, token);
        
        // Get presigned URLs for all items
        const itemsWithUrls = await Promise.all(
          items.map(async (item: MenuItem) => {
            const presignedUrl = await uploadService.getViewPresignedUrl(item.imageUrl, token);
            return { ...item, presignedUrl };
          })
        );
        
        setItems(itemsWithUrls);
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
      <div className={styles.header}>
        <h1 className={styles.title}>Menu Items</h1>
      </div>
      
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
          <div key={item.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img 
                src={item.presignedUrl} 
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
          </div>
        ))}
      </div>
    </div>
  );
} 