// src/components/UserHeader/UserHeader.tsx
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import styles from './UserHeader.module.css';

const UserHeader = () => {
  const navigate = useNavigate();
  // Получаем текущего пользователя из localStorage
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');

  const getFullName = () => {
    const lastName = currentUser.last_name || '';
    const firstInitial = currentUser.first_name?.charAt(0) || '';
    const patronymicInitial = currentUser.patronymic?.charAt(0) || '';

    return `${lastName}${firstInitial ? ` ${firstInitial}.` : ''}${patronymicInitial ? ` ${patronymicInitial}.` : ''}`.trim();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже если произошла ошибка, перенаправляем на логин
      navigate('/login');
    }
  };

  return (
    <div className={styles.userInfo}>
      <div className={styles.avatar}>
        {currentUser.avatar_url ? (
          <img
            src={currentUser.avatar_url}
            alt="Аватар пользователя"
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {currentUser.first_name?.charAt(0)}{currentUser.last_name?.charAt(0)}
          </div>
        )}
      </div>
      <div className={styles.userDetails}>
        <h2 className={styles.userName}>{getFullName()}</h2>
        <p className={styles.userRole}>{currentUser.position?.name || 'Администратор'}</p>
      </div>
      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        title="Выйти"
        aria-label="Выйти из аккаунта"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  );
};

export default UserHeader;
