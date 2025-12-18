export type TaskStatus = 'active' | 'accomplished' | 'carry_over';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_date: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppState {
  id: string;
  last_viewed_date: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      app_state: {
        Row: AppState;
        Insert: Omit<AppState, 'id' | 'updated_at'>;
        Update: Partial<Omit<AppState, 'id' | 'updated_at'>>;
      };
    };
  };
}

