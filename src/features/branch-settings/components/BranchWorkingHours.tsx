import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { WorkingHours, workingHoursService } from '../services/workingHoursService';
import useAuth from '../../auth/useAuth.hook';
import styles from './WorkingHours.module.css';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function BranchWorkingHours() {
  const { branchId } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    startWorkingHour: '08:00:00',
    endWorkingHour: '17:30:00',
    workingDays: [true, true, true, true, true, false, false]
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (branchId) {
      fetchWorkingHours();
    }
  }, [branchId]);

  const fetchWorkingHours = async () => {
    if (!branchId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await workingHoursService.getWorkingHours(branchId);
      
      // Ensure workingDays is always an array of 7 booleans
      const workingDays = Array.isArray(data.workingDays) && data.workingDays.length === 7 
        ? data.workingDays 
        : [true, true, true, true, true, false, false];
      
      setWorkingHours({
        startWorkingHour: data.startWorkingHour || '08:00:00',
        endWorkingHour: data.endWorkingHour || '17:30:00',
        workingDays: workingDays
      });
    } catch (err: any) {
      console.error('Error fetching working hours:', err);
      setError('Failed to load working hours');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (field: 'startWorkingHour' | 'endWorkingHour', value: string) => {
    // Convert from HH:mm to HH:mm:ss format
    const timeWithSeconds = value + ':00';
    setWorkingHours(prev => ({
      ...prev,
      [field]: timeWithSeconds
    }));
    setSuccess(false);
  };

  const handleDayToggle = (dayIndex: number) => {
    setWorkingHours(prev => {
      const newWorkingDays = prev.workingDays.map((day, index) => 
        index === dayIndex ? !day : day
      );
      
      return {
        ...prev,
        workingDays: newWorkingDays
      };
    });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    // Validate workingDays array
    if (!Array.isArray(workingHours.workingDays) || workingHours.workingDays.length !== 7) {
      setError('Invalid working days configuration');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await workingHoursService.updateWorkingHours(branchId, workingHours);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error updating working hours:', err);
      setError('Failed to update working hours');
    } finally {
      setSaving(false);
    }
  };

  // Convert HH:mm:ss to HH:mm for input display
  const formatTimeForInput = (time: string) => {
    return time.substring(0, 5); // Remove seconds part
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon icon="mdi:loading" className={styles.spinner} />
        <p>Loading working hours...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Icon icon="mdi:clock-outline" className={styles.headerIcon} />
        <div>
          <h2>Branch Working Hours</h2>
          <p>Set your branch's operating hours and working days</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.timeSection}>
          <h3>Operating Hours</h3>
          <div className={styles.timeInputs}>
            <div className={styles.timeInput}>
              <label htmlFor="startTime">Opening Time</label>
              <input
                type="time"
                id="startTime"
                value={formatTimeForInput(workingHours.startWorkingHour)}
                onChange={e => handleTimeChange('startWorkingHour', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.timeInput}>
              <label htmlFor="endTime">Closing Time</label>
              <input
                type="time"
                id="endTime"
                value={formatTimeForInput(workingHours.endWorkingHour)}
                onChange={e => handleTimeChange('endWorkingHour', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.daysSection}>
          <h3>Working Days</h3>
          <p className={styles.sectionDescription}>Select the days your branch is open</p>
          <div className={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className={styles.dayItem}>
                <label className={styles.dayLabel}>
                  <input
                    type="checkbox"
                    checked={workingHours.workingDays[index]}
                    onChange={() => handleDayToggle(index)}
                    className={styles.checkbox}
                  />
                  <span className={`${styles.dayName} ${workingHours.workingDays[index] ? styles.active : ''}`}>
                    {day}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <Icon icon="mdi:alert-circle" />
            {error}
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <Icon icon="mdi:check-circle" />
            Working hours updated successfully!
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={fetchWorkingHours}
            disabled={loading || saving}
            className={styles.resetButton}
          >
            <Icon icon="mdi:refresh" />
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? (
              <>
                <Icon icon="mdi:loading" className={styles.spinner} />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="mdi:content-save" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
