import { useEffect, useState } from 'react';
import useAuth from '../auth/useAuth.hook';
import styles from './KitchenPower.module.css';
import {
  kitchenPowerService,
  Kitchen,
  KitchenPower,
  KitchenPowerStatus
} from './services/kitchenPowerService';

export default function KitchenPowerPage() {
  const { token, restaurantId, branchId } = useAuth();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [kitchenPowers, setKitchenPowers] = useState<Record<string, KitchenPower>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const getStatusText = (status: KitchenPowerStatus): string => {
    if (status === KitchenPowerStatus.ACTIVE) {
      return 'Active';
    } else if (status === KitchenPowerStatus.INACTIVE) {
      return 'Inactive';
    } else if (status === KitchenPowerStatus.MAINTENANCE) {
      return 'Maintenance';
    }
    return 'Unknown';
  };

  const getStatusClass = (status: KitchenPowerStatus): string => {
    if (status === KitchenPowerStatus.ACTIVE) {
      return styles.active;
    } else if (status === KitchenPowerStatus.INACTIVE) {
      return styles.inactive;
    } else if (status === KitchenPowerStatus.MAINTENANCE) {
      return styles.maintenance;
    }
    return styles.inactive;
  };

  useEffect(() => {
    if (!restaurantId || !branchId || !token) return;
    fetchData();
  }, [restaurantId, branchId, token]);

  const fetchData = async () => {
    try {
      // First fetch all kitchens
      const kitchensData = await kitchenPowerService.getRestaurantKitchens(restaurantId!);
      setKitchens(kitchensData);

      // Then fetch power data for each kitchen
      const powerPromises = kitchensData.map(kitchen =>
        kitchenPowerService.getKitchenPower(branchId!, kitchen.id)
      );

      const powerResponses = await Promise.all(powerPromises);
      const powersMap = powerResponses.reduce((acc, power) => {
        if (power) { // Only add kitchens that have power configuration
          acc[power.kitchenId] = power;
        }
        return acc;
      }, {} as Record<string, KitchenPower>);

      setKitchenPowers(powersMap);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePowerUpdate = async (kitchenId: string, units: number) => {
    // Only proceed if the kitchen has power configuration
    if (!kitchenPowers[kitchenId] || !branchId || !token) {
      return;
    }

    setUpdating(kitchenId);
    try {
      const currentStatus = kitchenPowers[kitchenId].status;
      
      const updatedPower = await kitchenPowerService.updateKitchenPower(
        branchId,
        kitchenId,
        {
          units,
          status: currentStatus
        }
      );
      
      setKitchenPowers(prev => ({
        ...prev,
        [kitchenId]: updatedPower
      }));
    } catch (err) {
      setError('Failed to update kitchen power');
      console.error('Error updating kitchen power:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading kitchen data...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kitchen Power Management</h1>
      
      <div className={styles.kitchenGrid}>
        {kitchens.map(kitchen => {
          const power = kitchenPowers[kitchen.id];
          return (
            <div key={kitchen.id} className={styles.kitchenCard}>
              <h2 className={styles.kitchenName}>{kitchen.name}</h2>
              <p className={styles.description}>{kitchen.description}</p>
              
              <div className={styles.powerSection}>
                <div className={styles.powerInfo}>
                  <span className={styles.label}>Current Power:</span>
                  <span className={styles.value}>{power?.units || 0} units</span>
                </div>
                
                <div className={styles.powerStatus}>
                  <span className={styles.label}>Status:</span>
                  <span className={`${styles.status} ${getStatusClass(power?.status)}`}>
                    {getStatusText(power?.status)}
                  </span>
                </div>

                <div className={styles.powerControl}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={power?.units || 0}
                    onChange={(e) => handlePowerUpdate(kitchen.id, parseInt(e.target.value))}
                    disabled={updating === kitchen.id}
                    className={styles.powerInput}
                  />
                  <span className={styles.unitsLabel}>units</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 