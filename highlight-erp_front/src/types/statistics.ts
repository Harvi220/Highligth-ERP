export interface DocumentStatus {
  id: number;
  title: string;
  status: 'assigned' | 'read';
}

export interface Position {
  id: number;
  name: string;
}

export interface EmployeeStatistics {
  id: number;
  last_name: string;
  first_name: string;
  patronymic?: string;
  position: Position;
  avatar_url: string | null;
  documents: DocumentStatus[];
}
