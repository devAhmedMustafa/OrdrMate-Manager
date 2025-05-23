import { useEffect, useState } from 'react';
import useAuth from '../auth/useAuth.hook';
import axios from 'axios';
import { Icon } from '@iconify/react';
import styles from './Tables.module.css';

interface Table {
  tableNumber: number;
  seats: number;
  branchId: string;
}

export default function TablesPage() {
  const { branchId, token } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTable, setNewTable] = useState({ tableNumber: '', seats: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [branchId]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`http://localhost:5126/api/Table/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTables(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load tables');
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axios.post('http://localhost:5126/api/Table/', {
        tableNumber: parseInt(newTable.tableNumber),
        seats: parseInt(newTable.seats),
        branchId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNewTable({ tableNumber: '', seats: '' });
      fetchTables();
    } catch (err) {
      setError('Failed to add table');
      console.error('Error adding table:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTable = async (tableNumber: number) => {
    try {
      await axios.delete(`http://localhost:5126/api/Table/${branchId}/${tableNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchTables();
    } catch (err) {
      setError('Failed to delete table');
      console.error('Error deleting table:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon icon="eos-icons:loading" className={styles.spinner} />
        <h3>Loading Tables</h3>
        <p>Please wait while we fetch your tables...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tables</h1>
        <button 
          className={styles.addButton}
          onClick={() => setIsAdding(true)}
        >
          <Icon icon="mdi:table-plus" className={styles.icon} />
          Add Table
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <Icon icon="mdi:alert-circle" className={styles.icon} />
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddTable} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="tableNumber">Table Number</label>
            <input
              type="number"
              id="tableNumber"
              value={newTable.tableNumber}
              onChange={(e) => setNewTable(prev => ({ ...prev, tableNumber: e.target.value }))}
              required
              min="1"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="seats">Number of Seats</label>
            <input
              type="number"
              id="seats"
              value={newTable.seats}
              onChange={(e) => setNewTable(prev => ({ ...prev, seats: e.target.value }))}
              required
              min="1"
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Add Table
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.tablesGrid}>
        {tables.map((table) => (
          <div key={table.tableNumber} className={styles.tableCard}>
            <div className={styles.tableInfo}>
              <h3>Table {table.tableNumber}</h3>
              <p>{table.seats} Seats</p>
            </div>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteTable(table.tableNumber)}
            >
              <Icon icon="mdi:delete" className={styles.icon} />
            </button>
          </div>
        ))}
      </div>

      {tables.length === 0 && !isAdding && (
        <div className={styles.empty}>
          <Icon icon="mdi:table-off" className={styles.icon} />
          <h3>No Tables Found</h3>
          <p>Add your first table to get started</p>
        </div>
      )}
    </div>
  );
} 