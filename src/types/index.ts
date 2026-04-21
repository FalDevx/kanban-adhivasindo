export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Undefined';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  label: TaskLabel;
  priority: TaskPriority;
  dueDate: string;
  assignees: Assignee[];
  subtasks: Subtask[];
  attachments: string[];
  coverImage: string | null;
  comments: number;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export interface FilterState {
  searchQuery: string;
  labels: TaskLabel[];
  assignees: string[];
  dueDateRange?: {
    start: string;
    end: string;
  };
}
