// src/services/auth.ts
import api from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    last_name: string;
    first_name: string;
    patronymic: string | null;
    position?: {
      id: number;
      name: string;
    };
    phone: string;
    role?: {
      id: number;
      name: string;
    };
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

// Авторизация пользователя
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post('/login', credentials);

    // Сохраняем токен и данные пользователя в localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
};

// Выход из системы
export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    // Всегда очищаем токен и данные пользователя, даже если запрос завершился ошибкой
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

// Получение данных текущего пользователя
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    throw error;
  }
};