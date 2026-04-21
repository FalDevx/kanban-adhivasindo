import { IonApp, IonToast, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import { useEffect, useState } from 'react';
import { useTaskStore } from './store/taskStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { TaskDetailModal } from './components/TaskDetailModal';
import { Task, Column, Assignee } from './types';

setupIonicReact();

const sampleAssignees: Record<string, Assignee> = {
  'jd-1': {
    id: 'jd-1',
    name: 'John Doe',
    initials: 'JD',
    color: '#3b82f6',
  },
  'ms-1': {
    id: 'ms-1',
    name: 'Mary Smith',
    initials: 'MS',
    color: '#10b981',
  },
  'ab-1': {
    id: 'ab-1',
    name: 'Alice Brown',
    initials: 'AB',
    color: '#f59e0b',
  },
  'cd-1': {
    id: 'cd-1',
    name: 'Charlie Davis',
    initials: 'CD',
    color: '#ef4444',
  },
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const sampleTasks: Task[] = [
  {
    id: generateId(),
    title: 'Research for a podcast and video website',
    description:
      'Research best practices and tools for creating a podcast and video platform.',
    columnId: 'todo',
    label: 'Feature',
    priority: 'High',
    dueDate: 'Aug 8',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ms-1']],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Debug checkout process for e-commerce website',
    description: 'Fix issues with the checkout flow causing cart abandonment.',
    columnId: 'todo',
    label: 'Bug',
    priority: 'High',
    dueDate: 'Aug 10',
    assignees: [
      sampleAssignees['jd-1'],
      sampleAssignees['ms-1'],
      sampleAssignees['ab-1'],
    ],
    subtasks: [
      ...Array(10)
        .fill(null)
        .map((_, i) => ({
          id: generateId(),
          title: `Completed subtask ${i + 1}`,
          completed: true,
        })),
      ...Array(9)
        .fill(null)
        .map((_, i) => ({
          id: generateId(),
          title: `Pending subtask ${i + 1}`,
          completed: false,
        })),
    ],
    attachments: [],
    coverImage: null,
    comments: 43,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Design wireframes for the landing page revamp',
    description: 'Create comprehensive wireframes for the new landing page design.',
    columnId: 'doing',
    label: 'Feature',
    priority: 'Medium',
    dueDate: 'Aug 12',
    assignees: [sampleAssignees['ms-1'], sampleAssignees['ab-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Architecture review session',
    description: 'Review current system architecture and plan improvements.',
    columnId: 'doing',
    label: 'Undefined',
    priority: 'Medium',
    dueDate: 'Aug 11',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/3938021/pexels-photo-3938021.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Install and set up a marketing tool',
    description: 'Configure and integrate the new marketing automation tool.',
    columnId: 'doing',
    label: 'Undefined',
    priority: 'Low',
    dueDate: 'Aug 14',
    assignees: [sampleAssignees['cd-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Create and refine logo designs for the UI brand',
    description: 'Design multiple logo variations and select the best option.',
    columnId: 'review',
    label: 'Issue',
    priority: 'Medium',
    dueDate: 'Aug 15',
    assignees: [sampleAssignees['ms-1'], sampleAssignees['ab-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 52,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Create an icon library for the project',
    description: 'Build a comprehensive icon library following design guidelines.',
    columnId: 'review',
    label: 'Feature',
    priority: 'Medium',
    dueDate: 'Aug 8',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Create the Email Page layout and necessary components',
    description: 'Build the email page layout with all required components.',
    columnId: 'done',
    label: 'Feature',
    priority: 'High',
    dueDate: 'Aug 5',
    assignees: [sampleAssignees['jd-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 43,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Blog Edit Page Modification and Playlist Page Design',
    description: 'Modify the blog edit page and design a new playlist page.',
    columnId: 'rework',
    label: 'Feature',
    priority: 'Medium',
    dueDate: 'Aug 8',
    assignees: [sampleAssignees['ab-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 0,
    createdAt: new Date().toISOString(),
  },
];

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: '#e0e7ff' },
  { id: 'doing', title: 'Doing', color: '#e0e7ff' },
  { id: 'review', title: 'Review', color: '#e0e7ff' },
  { id: 'done', title: 'Done', color: '#e0e7ff' },
  { id: 'rework', title: 'Rework', color: '#e0e7ff' },
];

function App() {
  const { addTask, loadFromStorage, toast, hideToast, tasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadFromStorage();
    const stored = localStorage.getItem('kanban_tasks');
    if (!stored || Object.keys(stored).length === 0) {
      sampleTasks.forEach((task) => addTask(task));
    }
    setInitialized(true);
  }, [addTask]);

  const handleSelectTask = (taskId: string) => {
    if (taskId.startsWith('new-')) {
      const columnId = taskId.replace('new-', '');
      const newTask: Task = {
        id: generateId(),
        title: 'New Task',
        description: '',
        columnId,
        label: 'Undefined',
        priority: 'Medium',
        dueDate: '',
        assignees: [],
        subtasks: [],
        attachments: [],
        coverImage: null,
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      setEditingTask(newTask);
    } else {
      setEditingTask(tasks[taskId] || null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (!initialized) {
    return <IonApp></IonApp>;
  }

  return (
    <IonApp>
      <div className="flex h-screen bg-board-bg">
        <div className="w-56 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <Board onSelectTask={handleSelectTask} columns={defaultColumns} />
        </div>
      </div>

      {editingTask && (
        <TaskDetailModal
          isOpen={isModalOpen}
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}

      {toast && (
        <IonToast
          isOpen={!!toast}
          onDidDismiss={hideToast}
          message={toast.message}
          duration={2000}
          position="bottom"
          color={toast.type === 'success' ? 'success' : 'danger'}
        />
      )}
    </IonApp>
  );
}

export default App;
