import { IonModal, IonIcon, IonPopover } from '@ionic/react';
import {
  closeOutline, checkmarkOutline, imageOutline, pencilOutline,
  addOutline, checkmarkCircleOutline, chatbubbleOutline,
  documentTextOutline, trashOutline, calendarOutline,
} from 'ionicons/icons';
import { Task, Subtask, Assignee } from '../types';
import { useState, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';

const AVAILABLE_ASSIGNEES: Assignee[] = [
  { id: '1', name: 'John Doe',    initials: 'JD', color: '#4f46e5' },
  { id: '2', name: 'Mike Smith',  initials: 'MS', color: '#0891b2' },
  { id: '3', name: 'Alex Brown',  initials: 'AB', color: '#d97706' },
  { id: '4', name: 'Chris Davis', initials: 'CD', color: '#059669' },
  { id: '5', name: 'Blake Lee',   initials: 'BL', color: '#dc2626' },
];

interface Props { isOpen: boolean; task: Task | null; onClose: () => void; }

  /* shared input style */
const si: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '13px',
  border: '1px solid #e5e7eb', borderRadius: '6px',
  outline: 'none', color: '#111827', background: '#fff',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const rowStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '4px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, color: '#6b7280',
  letterSpacing: '0.04em',
};

export const TaskDetailModal: React.FC<Props> = ({ isOpen, task, onClose }) => {
  const { updateTask, addTask, getTaskById } = useTaskStore();
  const [t, setT] = useState<Task | null>(task);
  const [assigneeOpen, setAssigneeOpen] = useState<Event | null>(null);
  const [marked, setMarked] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  const sync = () => setT(task);

  if (!t) return null;

  const save = () => {
    if (!t) return;
    getTaskById(t.id) ? updateTask(t) : addTask(t);
    onClose();
  };

  const onImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setT({ ...t, coverImage: ev.target?.result as string });
    r.readAsDataURL(f);
  };

  const onAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setT({ ...t, attachments: [...t.attachments, ...Array.from(e.target.files).map(f => f.name)] });
  };

  const toggleA = (a: Assignee) => {
    const has = t.assignees.some(x => x.id === a.id);
    setT({ ...t, assignees: has ? t.assignees.filter(x => x.id !== a.id) : [...t.assignees, a] });
  };

  const addSub = () => {
    const s: Subtask = { id: Math.random().toString(36).slice(2), title: '', completed: false };
    setT({ ...t, subtasks: [...t.subtasks, s] });
  };

  const done = t.subtasks.filter(s => s.completed).length;
  const total = t.subtasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} onWillPresent={sync}
      style={{ '--width': 'min(95vw, 980px)', '--height': 'min(90vh, 780px)', '--border-radius': '12px', '--box-shadow': '0 20px 60px rgba(0,0,0,0.15)' } as React.CSSProperties}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0, background: '#fff' }}>
          <button
            onClick={() => setMarked(!marked)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: `1.5px solid ${marked ? '#16a34a' : '#22c55e'}`, background: marked ? '#f0fdf4' : 'transparent', color: '#16a34a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
            <IonIcon icon={checkmarkOutline} style={{ fontSize: '14px' }} />
            {marked ? 'Completed' : 'Mark Complete'}
          </button>
          <button onClick={onClose}
            style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <IonIcon icon={closeOutline} style={{ fontSize: '18px' }} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ════ LEFT PANEL ════ */}
          <div style={{ width: '44%', flexShrink: 0, overflowY: 'auto', padding: '20px 24px', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff' }}>

            {/* Cover Image */}
            <div>
              {t.coverImage ? (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '140px', cursor: 'pointer', marginBottom: '4px' }}
                  onClick={() => fileRef.current?.click()}>
                  <img src={t.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'; }}>
                    <IonIcon icon={pencilOutline} style={{ color: '#fff', fontSize: '20px', opacity: 0 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                    />
                  </div>
                  <button onClick={e => { e.stopPropagation(); setT({ ...t, coverImage: null }); }}
                    style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  style={{ height: '110px', borderRadius: '8px', border: '1.5px dashed #d1d5db', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px', transition: '0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLDivElement).style.background = '#eef2ff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}>
                  <IonIcon icon={imageOutline} style={{ fontSize: '28px', color: '#9ca3af' }} />
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Add Cover Image</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onImg} style={{ display: 'none' }} />
            </div>

            {/* Title */}
            <div style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827', flex: 1 }}>
                  <input type="text" value={t.title}
                    onChange={e => setT({ ...t, title: e.target.value })}
                    placeholder="Task title..."
                    style={{ ...si, fontSize: '16px', fontWeight: 700, border: 'none', borderBottom: '2px solid #e5e7eb', borderRadius: 0, padding: '4px 0', background: 'transparent' }}
                    onFocus={e => (e.target.style.borderBottomColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderBottomColor = '#e5e7eb')} />
                </span>
                <IonIcon icon={pencilOutline} style={{ fontSize: '14px', color: '#9ca3af', flexShrink: 0 }} />
              </div>
            </div>

            {/* Assignee + Due Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Assignee */}
              <div style={rowStyle}>
                <label style={labelStyle}>Assignee</label>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px' }}>
                  {t.assignees.slice(0, 4).map((a, i) => (
                    <div key={a.id} title={a.name} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: a.color, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? '-6px' : 0, position: 'relative', zIndex: 10 - i, cursor: 'pointer' }}>
                      {a.initials}
                    </div>
                  ))}
                  {t.assignees.length > 4 && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#6b7280', marginLeft: '-6px' }}>
                      +{t.assignees.length - 4}
                    </div>
                  )}
                  <button onClick={e => setAssigneeOpen(e.nativeEvent)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px dashed #d1d5db', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: '16px', marginLeft: t.assignees.length > 0 ? '-6px' : 0, flexShrink: 0 }}>+</button>
                </div>
                <IonPopover isOpen={!!assigneeOpen} event={assigneeOpen ?? undefined} onDidDismiss={() => setAssigneeOpen(null)}>
                  <div style={{ padding: '8px', minWidth: '190px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', padding: '4px 8px 8px', letterSpacing: '0.08em' }}>SELECT ASSIGNEE</div>
                    {AVAILABLE_ASSIGNEES.map(a => {
                      const sel = t.assignees.some(x => x.id === a.id);
                      return (
                        <button key={a.id} onClick={() => toggleA(a)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 10px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff' }}>{a.initials}</div>
                            <span style={{ fontSize: '13px', color: '#374151' }}>{a.name}</span>
                          </div>
                          {sel && <IonIcon icon={checkmarkOutline} style={{ color: '#6366f1', fontSize: '14px' }} />}
                        </button>
                      );
                    })}
                  </div>
                </IonPopover>
              </div>

              {/* Due Date */}
              <div style={rowStyle}>
                <label style={labelStyle}>Due Date</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', background: '#fff' }}>
                  <IonIcon icon={calendarOutline} style={{ fontSize: '14px', color: '#9ca3af', flexShrink: 0 }} />
                  <input type="text" value={t.dueDate}
                    onChange={e => setT({ ...t, dueDate: e.target.value })}
                    placeholder="e.g. 20 Aug, 2025"
                    style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#374151', background: 'transparent', width: '100%', fontFamily: 'inherit' }} />
                </div>
              </div>
            </div>

            {/* Board + Column row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={rowStyle}>
                <label style={labelStyle}>Board</label>
                <select style={{ ...si, cursor: 'pointer' }}>
                  <option>Northern Light</option>
                  <option>Adhivasindo</option>
                  <option>Engineering</option>
                </select>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Column</label>
                <select value={t.columnId} onChange={e => setT({ ...t, columnId: e.target.value })} style={{ ...si, cursor: 'pointer' }}>
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="rework">Rework</option>
                </select>
              </div>
            </div>

            {/* Label + Priority row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={rowStyle}>
                <label style={labelStyle}>Label</label>
                <select value={t.label} onChange={e => setT({ ...t, label: e.target.value as any })} style={{ ...si, cursor: 'pointer' }}>
                  <option value="Feature">Feature</option>
                  <option value="Bug">Bug</option>
                  <option value="Issue">Issue</option>
                  <option value="Undefined">Undefined</option>
                </select>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Priority</label>
                <select value={t.priority} onChange={e => setT({ ...t, priority: e.target.value as any })} style={{ ...si, cursor: 'pointer' }}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Description (left) */}
            <div style={rowStyle}>
              <label style={labelStyle}>Description</label>
              <div style={{ position: 'relative' }}>
                <textarea value={t.description}
                  onChange={e => setT({ ...t, description: e.target.value })}
                  placeholder="Add description..."
                  rows={3}
                  style={{ ...si, resize: 'vertical', lineHeight: 1.6, paddingRight: '28px' }} />
                <IonIcon icon={pencilOutline} style={{ position: 'absolute', bottom: '10px', right: '8px', fontSize: '13px', color: '#d1d5db' }} />
              </div>
            </div>

          </div>

          {/* ════ RIGHT PANEL ════ */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Description (right — full) */}
            <div style={rowStyle}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px', display: 'block' }}>Description</label>
              <div style={{ position: 'relative' }}>
                <textarea value={t.description}
                  onChange={e => setT({ ...t, description: e.target.value })}
                  placeholder="Write full task details here..."
                  rows={4}
                  style={{ ...si, resize: 'vertical', lineHeight: 1.7, paddingRight: '28px', border: '1px solid #e5e7eb' }} />
                <IonIcon icon={pencilOutline} style={{ position: 'absolute', bottom: '10px', right: '8px', fontSize: '13px', color: '#d1d5db' }} />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '10px', display: 'block' }}>Attachments</label>
              {t.attachments.length === 0 ? (
                <div onClick={() => attachRef.current?.click()}
                  style={{ border: '1.5px dashed #d1d5db', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#fafafa', transition: '0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLDivElement).style.background = '#eef2ff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}>
                  <IonIcon icon={documentTextOutline} style={{ fontSize: '18px', color: '#9ca3af' }} />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Drag & Drop files here or <span style={{ color: '#6366f1', fontWeight: 600 }}>browse from device</span></span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {t.attachments.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IonIcon icon={documentTextOutline} style={{ color: '#6366f1', fontSize: '15px' }} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      </div>
                      <button onClick={() => setT({ ...t, attachments: t.attachments.filter((_, j) => j !== i) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '4px', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}>
                        <IonIcon icon={trashOutline} style={{ fontSize: '15px' }} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => attachRef.current?.click()}
                    style={{ padding: '8px', border: '1.5px dashed #d1d5db', borderRadius: '8px', background: 'transparent', fontSize: '12px', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}>
                    + Add more files
                  </button>
                </div>
              )}
              <input ref={attachRef} type="file" multiple onChange={onAttach} style={{ display: 'none' }} />
            </div>

            {/* Check List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Check List</label>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{done}/{total}</span>
              </div>

              {/* Progress bar — always visible */}
              <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#6366f1', borderRadius: '999px', transition: 'width 0.3s ease' }} />
              </div>

              {t.subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {t.subtasks.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                      <input type="checkbox" checked={s.completed}
                        onChange={() => setT({ ...t, subtasks: t.subtasks.map(x => x.id === s.id ? { ...x, completed: !x.completed } : x) })}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#6366f1', flexShrink: 0 }} />
                      <input type="text" value={s.title}
                        onChange={e => setT({ ...t, subtasks: t.subtasks.map(x => x.id === s.id ? { ...x, title: e.target.value } : x) })}
                        placeholder="Subtask item..."
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: s.completed ? '#9ca3af' : '#374151', textDecoration: s.completed ? 'line-through' : 'none', background: 'transparent', fontFamily: 'inherit' }} />
                      <button onClick={() => setT({ ...t, subtasks: t.subtasks.filter(x => x.id !== s.id) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e5e7eb', fontSize: '13px', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#e5e7eb')}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={addSub}
                style={{ width: '100%', padding: '9px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#fff'; }}>
                <IonIcon icon={addOutline} style={{ fontSize: '15px' }} />
                Add subtask
              </button>
            </div>

            {/* Activity */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '10px', display: 'block' }}>Activity</label>
              <div style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fafafa' }}>
                <IonIcon icon={chatbubbleOutline} style={{ fontSize: '24px', color: '#e5e7eb' }} />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>No recent activity</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '12px 20px', borderTop: '1px solid #f3f4f6', flexShrink: 0, background: '#fff' }}>
          <button onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            Discard
          </button>
          <button onClick={save}
            style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', background: '#6366f1', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', transition: '0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}>
            Save
          </button>
        </div>

      </div>
    </IonModal>
  );
};
