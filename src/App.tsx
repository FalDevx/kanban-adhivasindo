import { IonApp, setupIonicReact } from '@ionic/react';
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
import { Header } from './components/Header';
import { Board } from './components/Board';
import { TaskDetailModal } from './components/TaskDetailModal';
import { Task, Assignee } from './types';

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
    description: 'Research best practices and tools for creating a podcast and video platform.',
    columnId: 'todo',
    label: 'Feature',
    priority: 'High',
    dueDate: '8 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ms-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Debug checkout process for the e-commerce website',
    description: 'Fix issues with the checkout flow causing cart abandonment.',
    columnId: 'todo',
    label: 'Bug',
    priority: 'High',
    dueDate: '10 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ms-1'], sampleAssignees['ab-1']],
    subtasks: [
      ...Array(10).fill(null).map((_, i) => ({ id: generateId(), title: `Completed subtask ${i + 1}`, completed: true })),
      ...Array(9).fill(null).map((_, i) => ({ id: generateId(), title: `Pending subtask ${i + 1}`, completed: false })),
    ],
    attachments: [],
    coverImage: null,
    comments: 43,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Living room interior design',
    description: 'Design a modern living room interior.',
    columnId: 'todo',
    label: 'Feature',
    priority: 'Low',
    dueDate: '15 Aug',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Design wireframes for the landing page revamp',
    description: 'Create comprehensive wireframes for the new landing page design.',
    columnId: 'doing',
    label: 'Feature',
    priority: 'Medium',
    dueDate: '12 Aug',
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
    dueDate: '11 Aug',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Install and set up a marketing tool for team operations',
    description: 'Configure and integrate the new marketing automation tool.',
    columnId: 'doing',
    label: 'Undefined',
    priority: 'Low',
    dueDate: '14 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ms-1'], sampleAssignees['cd-1']],
    subtasks: [
      ...Array(12).fill(null).map((_, i) => ({ id: generateId(), title: `Step ${i + 1}`, completed: true })),
      ...Array(8).fill(null).map((_, i) => ({ id: generateId(), title: `Pending ${i + 1}`, completed: false })),
    ],
    attachments: [],
    coverImage: null,
    comments: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Create and refine logo designs for the UI brand',
    description: 'Design multiple logo variations and select the best option.',
    columnId: 'review',
    label: 'Issue',
    priority: 'Medium',
    dueDate: '15 Aug',
    assignees: [sampleAssignees['ms-1'], sampleAssignees['ab-1']],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?w=400',
    comments: 52,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Create an icon library for the project.',
    description: 'Build a comprehensive icon library following design guidelines.',
    columnId: 'review',
    label: 'Feature',
    priority: 'Medium',
    dueDate: '8 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ab-1']],
    subtasks: [
      ...Array(7).fill(null).map((_, i) => ({ id: generateId(), title: `Icon set ${i + 1}`, completed: true })),
      ...Array(11).fill(null).map((_, i) => ({ id: generateId(), title: `Pending ${i + 1}`, completed: false })),
    ],
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
    dueDate: '5 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ms-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 43,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Enhance website usability through user feedback',
    description: 'Collect and analyze user feedback to improve website usability.',
    columnId: 'done',
    label: 'Feature',
    priority: 'Medium',
    dueDate: '9 Aug',
    assignees: [sampleAssignees['ab-1'], sampleAssignees['cd-1']],
    subtasks: [],
    attachments: [],
    coverImage: null,
    comments: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Kitchen interior design project',
    description: 'Design and plan the kitchen interior renovation.',
    columnId: 'done',
    label: 'Feature',
    priority: 'Low',
    dueDate: '20 Aug',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Blog Edit Page Modification and Playlist Page Design',
    description: 'Modify the blog edit page and design a new playlist page.',
    columnId: 'rework',
    label: 'Feature',
    priority: 'Medium',
    dueDate: '8 Aug',
    assignees: [sampleAssignees['jd-1'], sampleAssignees['ab-1']],
    subtasks: [
      ...Array(7).fill(null).map((_, i) => ({ id: generateId(), title: `Task ${i + 1}`, completed: true })),
      ...Array(15).fill(null).map((_, i) => ({ id: generateId(), title: `Pending ${i + 1}`, completed: false })),
    ],
    attachments: [],
    coverImage: null,
    comments: 40,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Modern building architecture photography',
    description: 'Capture and edit photos of modern building architecture.',
    columnId: 'rework',
    label: 'Feature',
    priority: 'Low',
    dueDate: '15 Aug',
    assignees: [],
    subtasks: [],
    attachments: [],
    coverImage: 'https://images.pexels.com/photos/1486785/pexels-photo-1486785.jpeg?w=400',
    comments: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Plan and execute training sessions for new hires',
    description: 'Organize onboarding training for new team members.',
    columnId: 'rework',
    label: 'Issue',
    priority: 'High',
    dueDate: '9 Aug',
    assignees: [sampleAssignees['ms-1'], sampleAssignees['cd-1']],
    subtasks: [
      ...Array(5).fill(null).map((_, i) => ({ id: generateId(), title: `Session ${i + 1}`, completed: true })),
      ...Array(14).fill(null).map((_, i) => ({ id: generateId(), title: `Pending ${i + 1}`, completed: false })),
    ],
    attachments: [],
    coverImage: null,
    comments: 0,
    createdAt: new Date().toISOString(),
  },
];

function App() {
  const { addTask, getTaskById, addColumn } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [addListOpen, setAddListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('kanban_tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Object.keys(parsed).length > 0) {
          useTaskStore.getState().loadFromStorage();
          setInitialized(true);
          return;
        }
      } catch {
        // invalid data, re-seed
      }
    }
    // First time or empty — seed sample data
    sampleTasks.forEach((task) => addTask(task));
    setInitialized(true);
  }, []);

  const handleSelectTask = (taskId: string) => {
    if (taskId.startsWith('new-')) {
      const columnId = taskId.replace('new-', '');
      const newTask: Task = {
        id: generateId(),
        title: '',
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
      const found = getTaskById(taskId);
      setEditingTask(found || null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleAddList = () => {
    const name = newListName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    addColumn({ id, title: name, color: '#e0e7ff' });
    setNewListName('');
    setAddListOpen(false);
  };

  if (!initialized) return <IonApp></IonApp>;

  return (
    <IonApp>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>
        <Header />
        <Board
          onSelectTask={handleSelectTask}
          onAddList={() => setAddListOpen(true)}
        />
      </div>

      {editingTask && (
        <TaskDetailModal
          isOpen={isModalOpen}
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}

      {/* ── ADD NEW LIST MODAL ── */}
      {addListOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
            onClick={() => { setAddListOpen(false); setNewListName(''); }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            zIndex: 201, width: '380px', padding: '28px',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
              Add New List
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8' }}>
              Buat kolom baru untuk board Adhivasindo
            </p>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
              NAMA KOLOM
            </label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              placeholder="e.g. In Progress, Backlog, Testing..."
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                outline: 'none', fontFamily: 'inherit', color: '#1e293b',
                boxSizing: 'border-box', marginBottom: '20px',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setAddListOpen(false); setNewListName(''); }}
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                Batal
              </button>
              <button
                onClick={handleAddList}
                disabled={!newListName.trim()}
                style={{
                  padding: '9px 24px', borderRadius: '8px', border: 'none',
                  background: newListName.trim() ? '#6366f1' : '#e2e8f0',
                  fontSize: '13px', fontWeight: 600,
                  color: newListName.trim() ? '#fff' : '#94a3b8',
                  cursor: newListName.trim() ? 'pointer' : 'not-allowed',
                }}>
                Buat List
              </button>
            </div>
          </div>
        </>
      )}
    </IonApp>
  );
}

export default App;
