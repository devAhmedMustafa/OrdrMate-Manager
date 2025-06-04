import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './Login.module.css';
import { authService, LoginCredentials } from './services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
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
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      if (response.restaurantId) {
        localStorage.setItem('restaurantId', response.restaurantId);
      }
      if (response.branchId) {
        localStorage.setItem('branchId', response.branchId);
      }

      // Redirect based on role
      switch (response.role) {
        case 'TopLevel':
          navigate('/dashboard');
          break;
        case 'BranchManager':
          navigate('/branch');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
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
          <Icon icon="mdi:account-circle" width={48} height={48} />
          <h1>Welcome Back</h1>
          <p>Please sign in to continue</p>
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