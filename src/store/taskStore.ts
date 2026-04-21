import { create } from 'zustand';
import { Task, Column, FilterState } from '../types';

interface TaskStore {
  tasks: Record<string, Task>;
  columns: Column[];
  filter: FilterState;
  selectedTaskId: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info'; visible: boolean } | null;

  // Task operations
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, columnId: string) => void;
  getTasks: (columnId: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;

  // Filter operations
  setSearchQuery: (query: string) => void;
  setLabelFilter: (labels: string[]) => void;
  setAssigneeFilter: (assignees: string[]) => void;
  setDueDateFilter: (start: string, end: string) => void;
  clearFilters: () => void;

  // UI operations
  setSelectedTask: (taskId: string | null) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'kanban_tasks';
const COLUMNS_KEY = 'kanban_columns';

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: '#e0e7ff' },
  { id: 'doing', title: 'Doing', color: '#e0e7ff' },
  { id: 'review', title: 'Review', color: '#e0e7ff' },
  { id: 'done', title: 'Done', color: '#e0e7ff' },
  { id: 'rework', title: 'Rework', color: '#e0e7ff' },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  columns: defaultColumns,
  filter: {
    searchQuery: '',
    labels: [],
    assignees: [],
  },
  selectedTaskId: null,
  toast: null,

  addTask: (task: Task) => {
    set((state) => {
      const newTasks = { ...state.tasks, [task.id]: task };
      const newState = { tasks: newTasks };
      setTimeout(() => {
        get().saveToStorage();
      }, 0);
      return newState;
    });
    get().showToast('Task created successfully', 'success');
  },

  updateTask: (task: Task) => {
    set((state) => {
      const newTasks = { ...state.tasks, [task.id]: task };
      const newState = { tasks: newTasks };
      setTimeout(() => {
        get().saveToStorage();
      }, 0);
      return newState;
    });
    get().showToast('Task updated successfully', 'success');
  },

  deleteTask: (taskId: string) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[taskId];
      const newState = { tasks: newTasks };
      setTimeout(() => {
        get().saveToStorage();
      }, 0);
      return newState;
    });
    get().showToast('Task deleted successfully', 'success');
  },

  moveTask: (taskId: string, columnId: string) => {
    const task = get().getTaskById(taskId);
    if (task) {
      get().updateTask({ ...task, columnId });
    }
  },

  getTasks: (columnId: string) => {
    const state = get();
    const tasks = Object.values(state.tasks).filter((task) => task.columnId === columnId);

    if (state.filter.searchQuery) {
      const query = state.filter.searchQuery.toLowerCase();
      return tasks.filter((task) =>
        task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
      );
    }

    if (state.filter.labels.length > 0) {
      return tasks.filter((task) => state.filter.labels.includes(task.label));
    }

    if (state.filter.assignees.length > 0) {
      return tasks.filter((task) =>
        task.assignees.some((a) => state.filter.assignees.includes(a.id))
      );
    }

    return tasks;
  },

  getTaskById: (taskId: string) => {
    return get().tasks[taskId];
  },

  setSearchQuery: (query: string) => {
    set((state) => ({
      filter: { ...state.filter, searchQuery: query },
    }));
  },

  setLabelFilter: (labels: string[]) => {
    set((state) => ({
      filter: { ...state.filter, labels: labels as any },
    }));
  },

  setAssigneeFilter: (assignees: string[]) => {
    set((state) => ({
      filter: { ...state.filter, assignees },
    }));
  },

  setDueDateFilter: (start: string, end: string) => {
    set((state) => ({
      filter: { ...state.filter, dueDateRange: { start, end } },
    }));
  },

  clearFilters: () => {
    set({
      filter: {
        searchQuery: '',
        labels: [],
        assignees: [],
      },
    });
  },

  setSelectedTask: (taskId: string | null) => {
    set({ selectedTaskId: taskId });
  },

  showToast: (message: string, type: 'success' | 'error' | 'info') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set({ toast: null });
    }, 2000);
  },

  hideToast: () => {
    set({ toast: null });
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set({ tasks: JSON.parse(stored) });
      } catch {
        console.error('Failed to load tasks from storage');
      }
    }
  },

  saveToStorage: () => {
    const state = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  },
}));
