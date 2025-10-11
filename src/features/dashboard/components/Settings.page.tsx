import { useState } from 'react';
import { Icon } from '@iconify/react';
import AddBranchPage from '../../restaurant_branches/AddBranch.page';
import styles from './Settings.module.css';

type SettingsTab = 'branches' | 'profile' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branches');
  

  const tabs = [
    { id: 'branches', label: 'Branches', icon: 'mdi:store' },
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
        
      </div>
    </div>
  );
} 