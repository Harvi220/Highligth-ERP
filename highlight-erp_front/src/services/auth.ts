// src/services/auth.ts
import api from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    position?: string;
    phone: string;
    role: string;
  };
  token: string;
}

// Авторизация пользователя
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post('/login', credentials);

    // Сохраняем токен в localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
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
    // Всегда очищаем токен, даже если запрос завершился ошибкой
    localStorage.removeItem('auth_token');
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