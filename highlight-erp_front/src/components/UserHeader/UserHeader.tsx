// src/components/UserHeader/UserHeader.tsx
import styles from './UserHeader.module.css';

const UserHeader = () => {
  // Получаем текущего пользователя из localStorage
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');

  const getFullName = () => {
    const lastName = currentUser.last_name || '';
    const firstInitial = currentUser.first_name?.charAt(0) || '';
    const patronymicInitial = currentUser.patronymic?.charAt(0) || '';

    return `${lastName}${firstInitial ? ` ${firstInitial}.` : ''}${patronymicInitial ? ` ${patronymicInitial}.` : ''}`.trim();
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
    </div>
  );
};

export default UserHeader;
