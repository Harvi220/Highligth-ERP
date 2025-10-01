// src/types/document.ts

export interface Document {
  id: number;
  title: string;
  description: string | null;
  file_url: string | null;
  original_filename: string;
  file_mime_type: string;
  file_size: number;
  is_for_all_employees: boolean;
  created_at: string;
  updated_at: string;
  status?: 'read' | 'unread'; // для сотрудника
}

export interface Position {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  last_name: string;
  first_name: string;
  patronymic: string | null;
  position?: Position;
  phone: string;
  role?: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentAssignment {
  document_id: number;
  user_id: number;
  status: 'read' | 'unread';
  read_at: string | null;
}

// Admin API responses
export interface AdminDocumentsResponse {
  data: Document[];
}

export interface AdminDocumentResponse {
  data: Document;
}

// Employee API responses
export interface EmployeeDocumentsResponse {
  documents: Document[];
  user: User;
}

export interface DocumentContentResponse {
  document: Document;
  content: string;
}