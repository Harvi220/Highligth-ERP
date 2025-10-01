// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('auth_token');
  const userDataStr = localStorage.getItem('user_data');

  // Если нет токена - перенаправляем на логин
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Если требуется конкретная роль - проверяем её
  if (requiredRole && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      const userRole = userData.role?.name;

      if (userRole !== requiredRole) {
        // Перенаправляем на правильную страницу в зависимости от роли
        if (userRole === 'admin') {
          return <Navigate to="/admin/documents" replace />;
        } else {
          return <Navigate to="/documents" replace />;
        }
      }
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;