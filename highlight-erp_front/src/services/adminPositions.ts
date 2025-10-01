// src/services/adminPositions.ts
import api from './api';

export interface Position {
  id: number;
  name: string;
}

interface PositionsResponse {
  data: Position[];
}

// Получение списка должностей
export const getAllPositions = async (): Promise<Position[]> => {
  try {
    // Временно получаем должности через API пользователей
    // В идеале должен быть отдельный эндпоинт /admin/positions
    const response = await api.get<PositionsResponse>('/admin/users');
    // Извлекаем уникальные должности из списка пользователей
    const users = response.data.data as any[];
    const positions = users
      .map(user => user.position)
      .filter((pos, index, self) =>
        pos && self.findIndex(p => p?.id === pos?.id) === index
      );
    return positions;
  } catch (error) {
    console.error('Ошибка при получении списка должностей:', error);
    // Возвращаем дефолтный список должностей
    return [
      { id: 1, name: 'Администратор' },
      { id: 2, name: 'Бармен' },
      { id: 3, name: 'Официант' }
    ];
  }
};
