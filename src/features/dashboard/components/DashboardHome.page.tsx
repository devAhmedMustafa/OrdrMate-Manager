import { useEffect, useState } from 'react';
import { tableCloudService } from '../../tables/services/tableCloudService';
import { balanceService, Balance } from '../services/balanceService';
import { ShiftResponse, shiftService, ShiftStatus } from '../services/shiftService';
import useAuth from '../../auth/useAuth.hook';
import styles from './DashboardHome.module.css';
import { Icon } from '@iconify/react';
import Table from '../../tables/models/Table';
import ShiftEarningsResponse from '../dtos/ShiftEarningsResponse.dto';
import TableReservationResponse from '../../tables/dtos/TableReservationResponse';

export default function DashboardHome() {
  const [tableQueues, setTableQueues] = useState<Record<number, TableReservationResponse[]>>({});
  const [tables, setTables] = useState<Table[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [shiftStatus, setShiftStatus] = useState<ShiftResponse | null>(null);
  const [isShiftLoading, setIsShiftLoading] = useState(false);
  const { branchId, token } = useAuth();
  const [shiftEarnings, setShiftEarnings] = useState<ShiftEarningsResponse | null>(null);

  useEffect(() => {
    if (!branchId || !token) return;

    const fetchTablesAndQueues = async () => {
      try {
        const tablesData = await tableCloudService.getTables(branchId);
        setTables(tablesData);
        const tableQueuesData: Record<number, TableReservationResponse[]> = {};
        for (const table of tablesData) {
          try {
            const queue = await tableCloudService.getTableQueue(branchId, table.tableNumber);
            tableQueuesData[table.tableNumber] = queue;
          } catch (error) {
            console.error(`Error fetching queue for table ${table.tableNumber}:`, error);
            tableQueuesData[table.tableNumber] = [];
          }
        }
        setTableQueues(tableQueuesData);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    const fetchBalance = async () => {
      try {
        const balanceData = await balanceService.getBalance(branchId, token);
        setBalance(balanceData);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    const fetchShiftStatus = async () => {
      try {
        const status = await shiftService.getShiftStatus(branchId);
        setShiftStatus(status);
      } catch (error) {
        console.error('Error fetching shift status:', error);
      }
    };

    const fetchShiftEarnings = async () => {
      try {
        const earnings = await shiftService.fetchShiftEarnings(branchId);
        setShiftEarnings(earnings);
      } catch (error) {
        console.error('Error fetching shift earnings:', error);
      }
    };

    // Initial fetch
    fetchTablesAndQueues();
    fetchBalance();
    fetchShiftStatus();
    fetchShiftEarnings();

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      fetchTablesAndQueues();
      fetchBalance();
      fetchShiftStatus();
      fetchShiftEarnings();
    }, 30000);

    return () => clearInterval(interval);
  }, [branchId, token]);

  const handleStartShift = async () => {
    if (!branchId) return;
    
    setIsShiftLoading(true);
    try {
      const result = await shiftService.startShift(branchId);
      setShiftStatus(result);
      // Refresh earnings after starting shift
      try {
        const earnings = await shiftService.fetchShiftEarnings(branchId);
        setShiftEarnings(earnings);
      } catch (earningsError) {
        console.error('Error fetching earnings after shift start:', earningsError);
      }
      alert('Shift started successfully!');
    } catch (error) {
      console.error('Error starting shift:', error);
      alert('Error starting shift. Please try again.');
    } finally {
      setIsShiftLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!branchId) return;
    
    if (!confirm('Are you sure you want to end the current shift?')) {
      return;
    }
    
    setIsShiftLoading(true);
    try {
      const result = await shiftService.endShift(branchId);
      setShiftStatus(result);
      // Refresh earnings after ending shift
      try {
        const earnings = await shiftService.fetchShiftEarnings(branchId);
        setShiftEarnings(earnings);
      } catch (earningsError) {
        console.error('Error fetching earnings after shift end:', earningsError);
      }
      alert('Shift ended successfully!');
    } catch (error) {
      console.error('Error ending shift:', error);
      alert('Error ending shift. Please try again.');
    } finally {
      setIsShiftLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon="mdi:clock-time-eight-outline" className={styles.sectionIcon} />
          Shift Management
        </h2>
        <div className={styles.shiftContainer}>
          <div className={styles.shiftStatus}>
            <span className={`${styles.statusIndicator} ${shiftStatus?.status === ShiftStatus.Started ? styles.active : styles.inactive}`}>
              <Icon icon={shiftStatus?.status === ShiftStatus.Started ? "mdi:circle" : "mdi:circle-outline"} />
              {shiftStatus?.status === ShiftStatus.Started ? 'Shift Active' : 'Shift Inactive'}
            </span>
            {shiftStatus?.status === ShiftStatus.Started && shiftStatus?.shiftStartTime && (
              <span className={styles.shiftTime}>
                Started: {new Date(shiftStatus.shiftStartTime).toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            className={`${styles.shiftButton} ${shiftStatus?.status === ShiftStatus.Started ? styles.endShift : styles.startShift}`}
            onClick={shiftStatus?.status === ShiftStatus.Started ? handleEndShift : handleStartShift}
            disabled={isShiftLoading}
          >
            <Icon icon={shiftStatus?.status === ShiftStatus.Started ? "mdi:stop-circle" : "mdi:play-circle"} className={styles.buttonIcon} />
            {isShiftLoading
              ? 'Processing...'
              : shiftStatus?.status === ShiftStatus.Started
                ? 'End Shift'
                : 'Start Shift'
            }
          </button>
        </div>
      </div>

      {shiftEarnings && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Icon icon="mdi:chart-line" className={styles.sectionIcon} />
            Current Shift Earnings
          </h2>
          <div className={styles.shiftEarningsGrid}>
            <div className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <Icon icon="mdi:cash" className={styles.balanceIcon} />
                <span>Shift Earnings</span>
              </div>
              <div className={styles.balanceAmount}>
                ${shiftEarnings.totalEarnings.toFixed(2)}
              </div>
            </div>
            <div className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <Icon icon="mdi:receipt" className={styles.balanceIcon} />
                <span>Total Orders</span>
              </div>
              <div className={styles.balanceAmount}>
                {shiftEarnings.totalOrders}
              </div>
            </div>
            <div className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <Icon icon="mdi:calculator" className={styles.balanceIcon} />
                <span>Avg per Order</span>
              </div>
              <div className={styles.balanceAmount}>
                ${Number(shiftEarnings.totalOrders) > 0 
                  ? (shiftEarnings.totalEarnings / Number(shiftEarnings.totalOrders)).toFixed(2)
                  : '0.00'
                }
              </div>
            </div>
            <div className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <Icon icon="mdi:clock-start" className={styles.balanceIcon} />
                <span>Shift Start</span>
              </div>
              <div className={styles.balanceAmount} style={{ fontSize: '1rem' }}>
                {new Date(shiftEarnings.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {shiftEarnings.endTime && (
              <div className={styles.balanceCard}>
                <div className={styles.balanceHeader}>
                  <Icon icon="mdi:clock-end" className={styles.balanceIcon} />
                  <span>Shift End</span>
                </div>
                <div className={styles.balanceAmount} style={{ fontSize: '1rem' }}>
                  {new Date(shiftEarnings.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              ${balance?.totalEarnings.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className={styles.balanceCard}>
            <div className={styles.balanceHeader}>
              <Icon icon="mdi:cash-clock" className={styles.balanceIcon} />
              <span>Today's Earnings</span>
            </div>
            <div className={styles.balanceAmount}>
              ${balance?.todayEarnings.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Icon icon="mdi:table" className={styles.sectionIcon} />
          Table Queues
        </h2>
        <div className={styles.grid}>
          {Object.entries(tableQueues).map(([tableNumber, reservations]) => {
            const currentReservation = reservations[0];
            return (
              <div key={tableNumber} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.tableInfo}>
                    <h3>Table {tableNumber}</h3>
                    <span className={styles.tableStatus}>Active</span>
                  </div>
                  <span className={styles.queueCount}>{reservations.length} reservations</span>
                </div>
                {currentReservation ? (
                  <div className={styles.currentItem}>
                    <div className={styles.reservationDetails}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{currentReservation.customerName}</span>
                        <span className={styles.orderId}>
                          {new Date(currentReservation.reservationDate).toLocaleTimeString()}
                        </span>
                        <span className={styles.guests}>
                          <Icon icon="mdi:account-group" />
                          {tables.find(t => t.tableNumber === parseInt(tableNumber))?.seats || 0} seats
                        </span>
                      </div>
                      <button
                        className={styles.markDoneButton}
                        onClick={() => {/* TODO: Implement mark table as done */}}
                        title="Mark as Ready"
                      >
                        <Icon icon="mdi:check-circle" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noItems}>
                    <Icon icon="mdi:check-circle" />
                    <span>No reservations</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 