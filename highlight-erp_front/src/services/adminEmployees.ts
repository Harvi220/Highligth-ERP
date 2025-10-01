// src/services/adminEmployees.ts
import api from './api';
import type { Employee } from '../types/employee';

interface EmployeesResponse {
  data: Employee[];
}

interface EmployeeResponse {
  data: Employee;
}

// Получение списка всех сотрудников (admin)
export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get<EmployeesResponse>('/admin/users');
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error);
    throw error;
  }
};

// Получение сотрудника по ID (admin)
export const getEmployeeById = async (id: number): Promise<Employee> => {
  try {
    const response = await api.get<EmployeeResponse>(`/admin/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении сотрудника:', error);
    throw error;
  }
};

// Создание нового сотрудника (admin)
export const createEmployee = async (data: {
  first_name: string;
  last_name: string;
  patronymic?: string;
  phone: string;
  password: string;
  position_id: number;
  documents?: number[];
}): Promise<Employee> => {
  try {
    const response = await api.post<EmployeeResponse>('/admin/users', data);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при создании сотрудника:', error);
    throw error;
  }
};

// Обновление сотрудника (admin)
export const updateEmployee = async (id: number, data: Partial<{
  first_name: string;
  last_name: string;
  patronymic?: string;
  phone: string;
  password?: string;
  position_id: number;
  role_id: number;
  documents?: number[];
}>): Promise<Employee> => {
  try {
    const response = await api.put<EmployeeResponse>(`/admin/users/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
    throw error;
  }
};

// Удаление сотрудника (admin)
export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    throw error;
  }
};
