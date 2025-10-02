import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './Login.module.css';
import { authService, LoginCredentials } from './services/authService';
import logo from '@/assets/OrdrMate.png';
import useAuth from './useAuth.hook';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      
      // Use auth context to store credentials
      login(response.token, response.role, response.storeId || '', response.branchId);

      // Redirect based on role
      switch (response.role) {
        case 'TopManager':
          navigate('/');
          break;
        case 'BranchManager':
          navigate('/branch');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        default:
          navigate('/error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <img src={logo} alt="Ordr Mate Logo" className={styles.logo} />
          <h1 className={styles.appName}>CSM</h1>
          <p className={styles.appSubtitle}>Clothing Store Manager</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          {error && (
            <div className={styles.error}>
              <Icon icon="mdi:alert-circle" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className={styles.spinner} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
