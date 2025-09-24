import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import AddBranchPage from '../../restaurant_branches/AddBranch.page';
import styles from './Settings.module.css';
import { uploadService } from '../../items/services/uploadService';
import useAuth from '../../auth/useAuth.hook';
import { restaurantService, RestaurantProfile } from '../services/restaurantService';

type SettingsTab = 'branches' | 'profile' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branches');
  const { pharmacyId: restaurantId } = useAuth();
  const [profileData, setProfileData] = useState<RestaurantProfile>({
    description: '',
    logoUrl: '',
    coverImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const tabs = [
    { id: 'branches', label: 'Branches', icon: 'mdi:store' },
    { id: 'profile', label: 'Profile', icon: 'mdi:account' },
    { id: 'notifications', label: 'Notifications', icon: 'mdi:bell' },
  ] as const;

  useEffect(() => {
    if (activeTab === 'profile' && restaurantId) {
      fetchProfile();
    }
  }, [activeTab, restaurantId]);

  const fetchProfile = async () => {
    try {
      const profile = await restaurantService.getProfile(restaurantId!);
      setProfileData(profile);

      // Load logo image independently
      if (profile.logoUrl) {
        try {
          const logoUrl = await uploadService.getViewPresignedUrl(profile.logoUrl);
          setLogoPreview(logoUrl);
        } catch (err) {
          console.error('Failed to load logo image:', err);
          setError('Failed to load logo image');
        }
      }

      // Load cover image independently
      if (profile.coverImageUrl) {
        try {
          const coverUrl = await uploadService.getViewPresignedUrl(profile.coverImageUrl);
          setCoverPreview(coverUrl);
        } catch (err) {
          console.error('Failed to load cover image:', err);
          setError('Failed to load cover image');
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(file.name, file.type);
      await uploadService.uploadFile(uploadUrl, file);

      const previewUrl = await uploadService.getViewPresignedUrl(fileUrl);
      if (type === 'logo') {
        setLogoPreview(previewUrl);
        setProfileData(prev => ({ ...prev, logoUrl: fileUrl }));
      } else {
        setCoverPreview(previewUrl);
        setProfileData(prev => ({ ...prev, coverImageUrl: fileUrl }));
      }
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log(profileData);
      await restaurantService.updateProfile(restaurantId!, profileData);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          <div className={styles.profileSection}>
            <h3>Profile Settings</h3>
            <form onSubmit={handleSubmit} className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              <div className={styles.imageUploadSection}>
                <div className={styles.imageUpload}>
                  <label htmlFor="logo">Logo</label>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    className={styles.fileInput}
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className={styles.imagePreview} />
                  )}
                </div>

                <div className={styles.imageUpload}>
                  <label htmlFor="cover">Cover Image</label>
                  <input
                    type="file"
                    id="cover"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                    className={styles.fileInput}
                  />
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover preview" className={styles.imagePreview} />
                  )}
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>Profile updated successfully!</div>}

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
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