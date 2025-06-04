import { useEffect, useState } from 'react';
import useAuth from '../auth/useAuth.hook';
import { Icon } from '@iconify/react';
import styles from './Kitchens.module.css';
import { kitchenService, Kitchen } from './services/kitchenService';

export default function KitchensPage() {
  const { restaurantId } = useAuth();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newKitchen, setNewKitchen] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    fetchKitchens();
  }, [restaurantId]);

  const fetchKitchens = async () => {
    try {
      const data = await kitchenService.getRestaurantKitchens(restaurantId!);
      setKitchens(data);
      setError('');
    } catch (err) {
      setError('Failed to load kitchens');
      console.error('Error fetching kitchens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    
    setIsAdding(true);
    try {
      await kitchenService.createKitchen({
        name: newKitchen.name,
        description: newKitchen.description,
        restaurantId
      });
      setNewKitchen({ name: '', description: '' });
      fetchKitchens();
    } catch (err) {
      setError('Failed to add kitchen');
      console.error('Error adding kitchen:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKitchen = async (kitchenId: string) => {
    if (!window.confirm('Are you sure you want to delete this kitchen?')) return;
    
    try {
      await kitchenService.deleteKitchen(kitchenId);
      fetchKitchens();
    } catch (err) {
      setError('Failed to delete kitchen');
      console.error('Error deleting kitchen:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon icon="mdi:loading" className={styles.spinner} />
        <p>Loading kitchens...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Kitchens</h1>
        <form onSubmit={handleAddKitchen} className={styles.addForm}>
          <input
            type="text"
            placeholder="Kitchen Name"
            value={newKitchen.name}
            onChange={(e) => setNewKitchen(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newKitchen.description}
            onChange={(e) => setNewKitchen(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Kitchen'}
          </button>
        </form>
      </div>

      {error && (
        <div className={styles.error}>
          <Icon icon="mdi:alert-circle" />
          <p>{error}</p>
          <button onClick={fetchKitchens} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.kitchenList}>
        {kitchens.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="mdi:kitchen" />
            <h3>No Kitchens Found</h3>
            <p>Add your first kitchen to get started</p>
          </div>
        ) : (
          kitchens.map(kitchen => (
            <div key={kitchen.id} className={styles.kitchenCard}>
              <div className={styles.kitchenInfo}>
                <h3>{kitchen.name}</h3>
                <p>{kitchen.description}</p>
              </div>
              <div className={styles.actions}>
                <button
                  onClick={() => handleDeleteKitchen(kitchen.id)}
                  className={styles.deleteButton}
                >
                  <Icon icon="mdi:delete" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 