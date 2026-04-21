import { create } from 'zustand';
import { Task, Column, FilterState } from '../types';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

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

  // Column operations
  addColumn: (column: Column) => void;
  updateColumn: (column: Column) => void;
  deleteColumn: (columnId: string) => void;

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

const TASKS_KEY = 'kanban_tasks';
const COLUMNS_KEY = 'kanban_columns';

const defaultColumns: Column[] = [
  { id: 'todo',   title: 'To Do',   color: '#e0e7ff' },
  { id: 'doing',  title: 'Doing',   color: '#e0e7ff' },
  { id: 'review', title: 'Review',  color: '#e0e7ff' },
  { id: 'done',   title: 'Done',    color: '#e0e7ff' },
  { id: 'rework', title: 'Rework',  color: '#e0e7ff' },
];

const loadColumnsFromStorage = (): Column[] => {
  try {
    const stored = localStorage.getItem(COLUMNS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultColumns;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  columns: loadColumnsFromStorage(),
  filter: { searchQuery: '', labels: [], assignees: [] },
  selectedTaskId: null,
  toast: null,

  addTask: (task: Task) => {
    set((state) => ({ tasks: { ...state.tasks, [task.id]: task } }));
    setTimeout(() => get().saveToStorage(), 0);
    get().showToast('Task berhasil dibuat', 'success');
  },

  updateTask: (task: Task) => {
    set((state) => ({ tasks: { ...state.tasks, [task.id]: task } }));
    setTimeout(() => get().saveToStorage(), 0);
    get().showToast('Task berhasil diupdate', 'info');
  },

  deleteTask: (taskId: string) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[taskId];
      return { tasks: newTasks };
    });
    setTimeout(() => get().saveToStorage(), 0);
    get().showToast('Task berhasil dihapus', 'error');
  },

  moveTask: (taskId: string, columnId: string) => {
    const task = get().getTaskById(taskId);
    if (task) get().updateTask({ ...task, columnId });
  },

  // ── Column operations ──
  addColumn: (column: Column) => {
    set((state) => ({ columns: [...state.columns, column] }));
    setTimeout(() => {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(get().columns));
    }, 0);
    get().showToast(`List "${column.title}" berhasil dibuat`, 'success');
  },

  updateColumn: (column: Column) => {
    set((state) => ({
      columns: state.columns.map((c) => c.id === column.id ? column : c),
    }));
    setTimeout(() => {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(get().columns));
    }, 0);
  },

  deleteColumn: (columnId: string) => {
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
      // also remove tasks in that column
      tasks: Object.fromEntries(
        Object.entries(state.tasks).filter(([, t]) => t.columnId !== columnId)
      ),
    }));
    setTimeout(() => {
      const s = get();
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(s.columns));
      localStorage.setItem(TASKS_KEY, JSON.stringify(s.tasks));
    }, 0);
    get().showToast('List berhasil dihapus', 'error');
  },

  getTasks: (columnId: string) => {
    const state = get();
    let tasks = Object.values(state.tasks).filter((t) => t.columnId === columnId);
    if (state.filter.searchQuery) {
      const q = state.filter.searchQuery.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (state.filter.labels.length > 0) {
      tasks = tasks.filter((t) => state.filter.labels.includes(t.label));
    }
    if (state.filter.assignees.length > 0) {
      tasks = tasks.filter((t) => t.assignees.some((a) => state.filter.assignees.includes(a.id)));
    }
    return tasks;
  },

  getTaskById: (taskId: string) => get().tasks[taskId],

  setSearchQuery: (query) => set((s) => ({ filter: { ...s.filter, searchQuery: query } })),
  setLabelFilter: (labels) => set((s) => ({ filter: { ...s.filter, labels: labels as any } })),
  setAssigneeFilter: (assignees) => set((s) => ({ filter: { ...s.filter, assignees } })),
  setDueDateFilter: (start, end) => set((s) => ({ filter: { ...s.filter, dueDateRange: { start, end } } })),
  clearFilters: () => set({ filter: { searchQuery: '', labels: [], assignees: [] } }),
  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),

  showToast: (message, type) => {
    Toast.fire({ icon: type === 'error' ? 'error' : type, title: message });
  },
  hideToast: () => {},

  loadFromStorage: () => {
    try {
      const storedTasks = localStorage.getItem(TASKS_KEY);
      const storedCols = localStorage.getItem(COLUMNS_KEY);
      if (storedTasks) set({ tasks: JSON.parse(storedTasks) });
      if (storedCols) {
        const cols = JSON.parse(storedCols);
        if (Array.isArray(cols) && cols.length > 0) set({ columns: cols });
      }
    } catch {
      console.error('Failed to load from storage');
    }
  },

  saveToStorage: () => {
    const s = get();
    localStorage.setItem(TASKS_KEY, JSON.stringify(s.tasks));
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(s.columns));
  },
}));
