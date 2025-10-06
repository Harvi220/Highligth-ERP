// src/services/documents.ts
import api from './api';

export interface Document {
  id: number;
  title: string;
  description: string;
  status: 'read' | 'unread' | 'assigned';
  created_at?: string;
  updated_at?: string;
  file_path?: string;
  original_filename?: string;
  file_mime_type?: string;
  file_size?: number;
  pdf_file_path?: string;
  pdf_file_size?: number;
  has_pdf?: boolean;
}

export interface User {
  id: number;
  name: string;
  position?: string;
  phone?: string;
  avatar?: string;
}

export interface DocumentsResponse {
  documents: Document[];
  user: User;
}

export interface DocumentContentResponse {
  document: Document;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  user: User;
}

// Получение списка документов для сотрудника
export const getDocuments = async (): Promise<DocumentsResponse> => {
  try {
    const response = await api.get('/employee/documents');
    // API возвращает { data: [...] }, преобразуем в нужную структуру
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    return {
      documents: response.data.data || [],
      user: {
        id: userData.id,
        name: `${userData.last_name} ${userData.first_name}`,
        position: userData.position?.name,
        phone: userData.phone,
        avatar: userData.avatar_url
      }
    };
  } catch (error) {
    console.error('Ошибка при получении документов:', error);
    throw error;
  }
};

// Отметить документ как прочитанный
export const markDocumentAsRead = async (documentId: number): Promise<void> => {
  try {
    await api.post(`/employee/documents/${documentId}/read`);
  } catch (error) {
    console.error('Ошибка при отметке документа как прочитанного:', error);
    throw error;
  }
};

// Получение содержимого документа для просмотра
export const getDocumentContent = async (documentId: number): Promise<DocumentContentResponse> => {
  try {
    const response = await api.get(`/employee/documents/${documentId}/content`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении содержимого документа:', error);
    throw error;
  }
};

// Скачивание документа
export const downloadDocument = async (documentId: number): Promise<Blob> => {
  try {
    const response = await api.get(`/employee/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при скачивании документа:', error);
    throw error;
  }
};