import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import useAuth from '../auth/useAuth.hook';
import styles from './BranchRequests.module.css';

interface BranchRequest {
  branchRequestId: string;
  lantitude: number;
  longitude: number;
  branchAddress: string;
  branchPhoneNumber: string;
  restaurantName: string;
}

interface BranchCredentials {
  username: string;
  password: string;
}

export default function BranchRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<BranchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<BranchCredentials | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5126/api/Branch/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch branch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    try {
      const response = await fetch(`http://localhost:5126/api/Branch/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Check if the response contains the expected credentials
      if (data && data.username && data.password) {
        setCredentials({
          username: data.branchManagerUsername,
          password: data.branchManagerPassword
        });
        setShowCredentials(true);
      } else {
        console.error('Response does not contain expected credentials:', data);
        throw new Error('Invalid response format: missing credentials');
      }

      // Remove the approved request from the list
      setRequests(prev => prev.filter(req => req.branchRequestId !== requestId));
    } catch (err) {
      console.error('Error in handleApprove:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setApprovingId(null);
    }
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setCredentials(null);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon icon="mdi:loading" className={styles.spinner} />
        <p>Loading branch requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Icon icon="mdi:alert-circle" />
        <p>{error}</p>
        <button onClick={fetchRequests} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon icon="mdi:store-off" width={48} height={48} />
        <h3>No Pending Requests</h3>
        <p>There are no branch requests waiting for approval.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showCredentials && credentials && (
        <div className={styles.credentialsPopup}>
          <div className={styles.credentialsContent}>
            <h3>Branch Manager Credentials</h3>
            <div className={styles.credentialsInfo}>
              <p><strong>Username:</strong> {credentials.username}</p>
              <p><strong>Password:</strong> {credentials.password}</p>
            </div>
            <button onClick={handleCloseCredentials} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.header}>
        <h1>Branch Requests</h1>
        <p>Review and approve new branch requests</p>
      </div>

      <div className={styles.requestsList}>
        {requests.map((request) => (
          <div key={request.branchRequestId} className={styles.requestCard}>
            <div className={styles.requestInfo}>
              <div className={styles.infoGroup}>
                <label>Address</label>
                <p>{request.branchAddress}</p>
              </div>
              
              <div className={styles.infoGroup}>
                <label>Phone Number</label>
                <p>{request.branchPhoneNumber}</p>
              </div>
              
              <div className={styles.infoGroup}>
                <label>Location</label>
                <p>Lat: {request.lantitude}, Long: {request.longitude}</p>
              </div>
              
              <div className={styles.infoGroup}>
                <label>Restaurant Name</label>
                <p className={styles.id}>{request.restaurantName}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.approveButton}
                onClick={() => handleApprove(request.branchRequestId)}
                disabled={approvingId === request.branchRequestId}
              >
                {approvingId === request.branchRequestId ? (
                  <>
                    <Icon icon="mdi:loading" className={styles.spinner} />
                    Approving...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 