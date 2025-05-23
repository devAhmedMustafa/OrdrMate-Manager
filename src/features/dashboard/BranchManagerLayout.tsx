import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuth from '../auth/useAuth.hook';
import { Icon } from '@iconify/react';
import styles from './DashboardLayout.module.css';
import logo from '@/assets/OrdrMate.png';
import { RestaurantHeader } from './components/RestaurantHeader';

export function BranchManagerLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/branch', label: 'Home', icon: 'iconamoon:home-duotone' },
    { path: '/branch/orders', label: 'Orders', icon: 'lets-icons:order-duotone' },
    { path: '/branch/menu', label: 'Menu', icon: 'ic:twotone-menu-book' },
    { path: '/branch/tables', label: 'Tables', icon: 'mdi:table' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logo} width={40} alt="OrdrMate Logo" />
        </div>
        
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.navItem} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                <Icon icon={item.icon} className={styles.icon} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={logout} className={styles.logoutButton}>
          <Icon icon="solar:logout-3-bold-duotone" className={styles.icon} />
          Logout
        </button>
      </nav>

      <div className={styles.contentWrapper}>
        <RestaurantHeader />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
} 