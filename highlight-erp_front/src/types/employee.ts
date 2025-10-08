export interface Position {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Employee {
  documents: any;
  id: number;
  last_name: string;
  first_name: string;
  patronymic?: string;
  position: Position;
  phone: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
