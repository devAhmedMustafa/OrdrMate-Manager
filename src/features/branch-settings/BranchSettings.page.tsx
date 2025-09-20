import { useState } from 'react';
import { Icon } from '@iconify/react';
import BranchWorkingHours from './components/BranchWorkingHours';
import styles from './BranchSettings.module.css';

type BranchSettingsTab = 'working-hours' | 'notifications' | 'preferences';

export default function BranchSettingsPage() {
  const [activeTab, setActiveTab] = useState<BranchSettingsTab>('working-hours');

  const tabs = [
    { id: 'working-hours', label: 'Working Hours', icon: 'mdi:clock-outline' },
    { id: 'notifications', label: 'Notifications', icon: 'mdi:bell' },
    { id: 'preferences', label: 'Preferences', icon: 'mdi:cog' },
  ] as const;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Icon icon="mdi:cog" className={styles.headerIcon} />
          <div>
            <h1>Branch Settings</h1>
            <p>Manage your branch configuration and preferences</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <nav className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Settings</h2>
          </div>
          <ul className={styles.tabList}>
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tab} ${
                    activeTab === tab.id ? styles.activeTab : ''
                  }`}
                >
                  <Icon icon={tab.icon} className={styles.tabIcon} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tabContent}>
          {activeTab === 'working-hours' && (
            <BranchWorkingHours />
          )}
          {activeTab === 'notifications' && (
            <div className={styles.placeholder}>
              <Icon icon="mdi:bell" width={64} height={64} />
              <h3>Notification Settings</h3>
              <p>Configure branch notifications and alerts. Coming soon!</p>
            </div>
          )}
          {activeTab === 'preferences' && (
            <div className={styles.placeholder}>
              <Icon icon="mdi:cog" width={64} height={64} />
              <h3>Branch Preferences</h3>
              <p>Set up branch-specific preferences and defaults. Coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
