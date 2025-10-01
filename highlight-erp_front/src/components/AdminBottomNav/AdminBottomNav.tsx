// src/components/AdminBottomNav/AdminBottomNav.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminBottomNav.module.css';

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.bottomNav}>
      <button
        className={`${styles.navButton} ${isActive('/admin/employees') ? styles.active : ''}`}
        onClick={() => navigate('/admin/employees')}
      >
        <svg className={styles.icon} width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 26C6 21.5817 9.58172 18 14 18H18C22.4183 18 26 21.5817 26 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('/admin/documents') ? styles.active : ''}`}
        onClick={() => navigate('/admin/documents')}
      >
        <svg className={styles.icon} width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M9 4H19L25 10V28H9V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M19 4V10H25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${isActive('/admin/statistics') ? styles.active : ''}`}
        onClick={() => navigate('/admin/statistics')}
      >
        <svg className={styles.icon} width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
          <rect x="18" y="6" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
          <rect x="6" y="18" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
          <rect x="18" y="18" width="8" height="8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
    </nav>
  );
};

export default AdminBottomNav;
