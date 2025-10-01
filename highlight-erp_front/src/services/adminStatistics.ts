// src/services/adminStatistics.ts
import api from './api';
import type { EmployeeStatistics } from '../types/statistics';

interface StatisticsResponse {
  data: EmployeeStatistics[];
}

// Получение статистики по сотрудникам (admin)
export const getEmployeeStatistics = async (): Promise<EmployeeStatistics[]> => {
  try {
    const response = await api.get<StatisticsResponse>('/admin/statistics');
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    throw error;
  }
};
