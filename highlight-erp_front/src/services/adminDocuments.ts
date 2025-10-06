// src/services/adminDocuments.ts
import api from './api';
import type { Document, AdminDocumentsResponse, AdminDocumentResponse } from '../types/document';

export interface User {
  id: number;
  name: string;
  position: string | null;
  phone: string;
  avatar: string | null;
}

export interface DocumentContentResponse {
  document: Document;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  user: User;
}

// Получение списка всех документов (admin)
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get<AdminDocumentsResponse>('/admin/documents');
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении списка документов:', error);
    throw error;
  }
};

// Создание нового документа (admin)
export const createDocument = async (formData: FormData): Promise<Document> => {
  try {
    const response = await api.post<AdminDocumentResponse>('/admin/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при создании документа:', error);
    throw error;
  }
};

// Получение документа по ID (admin)
export const getDocumentById = async (id: number): Promise<Document> => {
  try {
    const response = await api.get<AdminDocumentResponse>(`/admin/documents/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении документа:', error);
    throw error;
  }
};

// Обновление документа (admin)
export const updateDocument = async (id: number, formData: FormData): Promise<Document> => {
  try {
    const response = await api.post<AdminDocumentResponse>(`/admin/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при обновлении документа:', error);
    throw error;
  }
};

// Удаление документа (admin)
export const deleteDocument = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/documents/${id}`);
  } catch (error) {
    console.error('Ошибка при удалении документа:', error);
    throw error;
  }
};

// Назначение документа пользователям (admin)
export const assignDocumentToUsers = async (documentId: number, userIds: number[]): Promise<void> => {
  try {
    await api.post(`/admin/documents/${documentId}/assign`, { user_ids: userIds });
  } catch (error) {
    console.error('Ошибка при назначении документа пользователям:', error);
    throw error;
  }
};

// Скачивание документа (admin)
export const downloadDocument = async (id: number, filename: string): Promise<void> => {
  try {
    const response = await api.get(`/admin/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при скачивании документа:', error);
    throw error;
  }
};

// Получение содержимого документа для просмотра (admin)
export const getDocumentContent = async (id: number): Promise<DocumentContentResponse> => {
  try {
    const response = await api.get<DocumentContentResponse>(`/admin/documents/${id}/content`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении содержимого документа:', error);
    throw error;
  }
};