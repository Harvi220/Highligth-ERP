// src/services/adminPositions.ts
import api from './api';

export interface Position {
  id: number;
  name: string;
}

export interface PositionsResponse {
  data: Position[];
}

export interface PositionResponse {
  data: Position;
}

// Получение списка всех должностей
export const getAllPositions = async (): Promise<Position[]> => {
  try {
    const response = await api.get<PositionsResponse>('/admin/positions');
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении должностей:', error);
    throw error;
  }
};

// Создание новой должности
export const createPosition = async (name: string): Promise<Position> => {
  try {
    const response = await api.post<PositionResponse>('/admin/positions', { name });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при создании должности:', error);
    throw error;
  }
};

// Обновление должности
export const updatePosition = async (id: number, name: string): Promise<Position> => {
  try {
    const response = await api.put<PositionResponse>(`/admin/positions/${id}`, { name });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при обновлении должности:', error);
    throw error;
  }
};

// Удаление должности
export const deletePosition = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/positions/${id}`);
  } catch (error) {
    console.error('Ошибка при удалении должности:', error);
    throw error;
  }
};
