import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth.hook';
import { Icon } from '@iconify/react';
import styles from './AddBranch.module.css';

interface BranchFormData {
  lantitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
}

export default function AddBranchPage() {
  const navigate = useNavigate();
  const { restaurantId, token } = useAuth();
  const [formData, setFormData] = useState<BranchFormData>({
    lantitude: 0,
    longitude: 0,
    branchAddress: '',
    branchPhoneNumber: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lantitude' || name === 'longitude' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!restaurantId) {
      setError('Restaurant ID is missing');
      return;
    }

    try {
      const response = await fetch('http://localhost:5126/api/Branch/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          restaurantId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add branch');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <Icon icon="mdi:store-plus" width={24} height={24} />
          <h2>Add New Branch</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="lantitude">Latitude</label>
              <input
                id="lantitude"
                name="lantitude"
                type="number"
                value={formData.lantitude}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="branchAddress">Branch Address</label>
            <input
              id="branchAddress"
              name="branchAddress"
              type="text"
              value={formData.branchAddress}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="branchPhoneNumber">Phone Number</label>
            <input
              id="branchPhoneNumber"
              name="branchPhoneNumber"
              type="tel"
              value={formData.branchPhoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <Icon icon="mdi:check-circle" width={20} height={20} />
              Branch added successfully!
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/settings')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={success}
            >
              <Icon icon="mdi:content-save" width={20} height={20} />
              Save Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 