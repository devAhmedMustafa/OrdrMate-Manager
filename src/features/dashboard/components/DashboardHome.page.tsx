import { useEffect, useState } from 'react';
import { balanceService, Balance } from '../services/balanceService';
import useAuth from '../../auth/useAuth.hook';
import styles from './DashboardHome.module.css';
import { Icon } from '@iconify/react';

export default function DashboardHome() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const { branchId, token } = useAuth();

  useEffect(() => {
    if (!branchId || !token) return

    const fetchBalance = async () => {
      try {
        const balanceData = await balanceService.getBalance(branchId, token);
        setBalance(balanceData);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    // Initial fetch
    fetchBalance();

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      fetchBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [branchId, token]);

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
              ${balance?.totalEarnings || '0.00'}
            </div>
          </div>
          <div className={styles.balanceCard}>
            <div className={styles.balanceHeader}>
              <Icon icon="mdi:cash-clock" className={styles.balanceIcon} />
              <span>Today's Earnings</span>
            </div>
            <div className={styles.balanceAmount}>
              ${balance?.todayEarnings || '0.00'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
} 