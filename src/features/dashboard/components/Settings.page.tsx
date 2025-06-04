import { useState } from 'react';
import { Icon } from '@iconify/react';
import AddBranchPage from '../../restaurant_branches/AddBranch.page';
import styles from './Settings.module.css';

type SettingsTab = 'branches' | 'profile' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branches');

  const tabs = [
    { id: 'branches', label: 'Branches', icon: 'mdi:store' },
    { id: 'profile', label: 'Profile', icon: 'mdi:account' },
    { id: 'notifications', label: 'Notifications', icon: 'mdi:bell' },
  ] as const;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2 className={styles.title}>Settings</h2>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon icon={tab.icon} width={20} height={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        {activeTab === 'branches' && <AddBranchPage />}
        {activeTab === 'profile' && (
          <div className={styles.placeholder}>
            <Icon icon="mdi:account" width={48} height={48} />
            <h3>Profile Settings</h3>
            <p>Profile settings will be available soon.</p>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className={styles.placeholder}>
            <Icon icon="mdi:bell" width={48} height={48} />
            <h3>Notification Settings</h3>
            <p>Notification settings will be available soon.</p>
          </div>
        )}
      </div>
    </div>
  );
} 