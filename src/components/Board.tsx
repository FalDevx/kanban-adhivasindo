import { IonIcon } from '@ionic/react';
import { addOutline, ellipsisVerticalOutline, expandOutline, trashOutline, pencilOutline } from 'ionicons/icons';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './TaskCard';
import {
  DndContext, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useRef } from 'react';
import Swal from 'sweetalert2';

interface BoardProps {
  onSelectTask: (taskId: string) => void;
  onAddList: () => void;
}

const getAccentColor = (id: string) => {
  const map: Record<string, string> = {
    todo: '#6366f1', doing: '#3b82f6', review: '#f59e0b', done: '#10b981', rework: '#ef4444',
  };
  return map[id] || '#6366f1';
};

export const Board: React.FC<BoardProps> = ({ onSelectTask, onAddList }) => {
  const {
    columns, getTasks, deleteTask, getTaskById, updateTask,
    updateColumn, deleteColumn, filter: _f, tasks: _t,
  } = useTaskStore();
  void _f; void _t;

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e: DragStartEvent) => setDraggedTaskId(e.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTaskId(null);
    if (!over) return;
    const task = getTaskById(active.id as string);
    if (!task) return;
    let newColId = over.id as string;
    const overTask = getTaskById(newColId);
    if (overTask) newColId = overTask.columnId;
    if (task.columnId !== newColId) updateTask({ ...task, columnId: newColId });
  };

  const handleRenameSubmit = (id: string) => {
    if (editingColumnName.trim()) {
      const col = columns.find(c => c.id === id);
      if (col) updateColumn({ ...col, title: editingColumnName.trim() });
    }
    setEditingColumnId(null);
  };

  const handleDeleteColumn = (id: string) => {
    setColumnMenuOpen(null);
    const col = columns.find(c => c.id === id);
    const taskCount = getTasks(id).length;
    Swal.fire({
      title: `Hapus list "${col?.title}"?`,
      text: taskCount > 0
        ? `List ini berisi ${taskCount} task yang akan ikut terhapus permanen.`
        : 'List ini akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(result => {
      if (result.isConfirmed) deleteColumn(id);
    });
  };

  const draggedTask = draggedTaskId ? getTaskById(draggedTaskId) : null;

  const ColumnContainer = ({ colId, isExpanded, children }: { colId: string; isExpanded: boolean; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: colId });
    return (
      <div ref={setNodeRef} style={{
        width: isExpanded ? '420px' : '280px', flexShrink: 0,
        backgroundColor: isOver ? '#f0f4ff' : '#ffffff',
        borderRadius: '12px', border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', minHeight: '200px',
        transition: 'all 0.2s ease',
        borderTop: `3px solid ${getAccentColor(colId)}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {children}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, overflowX: 'auto', background: '#f1f5f9' }}>
        <div style={{ display: 'inline-flex', gap: '16px', padding: '20px 24px', minHeight: '100%', alignItems: 'flex-start', minWidth: 'max-content' }}>

          {columns.map((column) => {
            const columnTasks = getTasks(column.id);
            const taskIds = columnTasks.map(t => t.id);
            const isExpanded = expandedColumn === column.id;

            return (
              <SortableContext key={column.id} items={taskIds} strategy={verticalListSortingStrategy}>
                <ColumnContainer colId={column.id} isExpanded={isExpanded}>

                  {/* Column Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      {editingColumnId === column.id ? (
                        <input autoFocus value={editingColumnName}
                          onChange={e => setEditingColumnName(e.target.value)}
                          onBlur={() => handleRenameSubmit(column.id)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(column.id); if (e.key === 'Escape') setEditingColumnId(null); }}
                          style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', border: 'none', borderBottom: '2px solid #6366f1', outline: 'none', background: 'transparent', width: '130px', padding: '0 0 2px', fontFamily: 'inherit' }} />
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{column.title}</span>
                      )}
                      <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '999px', padding: '1px 7px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        {columnTasks.length}
                      </span>
                      <button onClick={() => onSelectTask(`new-${column.id}`)}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #cbd5e1', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', padding: 0, flexShrink: 0 }}>
                        <IonIcon icon={addOutline} style={{ fontSize: '12px' }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                      {/* ⋮ menu */}
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setColumnMenuOpen(columnMenuOpen === column.id ? null : column.id)}
                          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                          <IonIcon icon={ellipsisVerticalOutline} style={{ fontSize: '16px' }} />
                        </button>

                        {columnMenuOpen === column.id && (
                          <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setColumnMenuOpen(null)} />
                            <div ref={menuRef} style={{ position: 'absolute', top: '30px', right: 0, background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '160px', padding: '4px' }}>
                              <button onClick={() => { setEditingColumnId(column.id); setEditingColumnName(column.title); setColumnMenuOpen(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151', textAlign: 'left' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <IonIcon icon={pencilOutline} style={{ fontSize: '14px', color: '#6366f1' }} />
                                Rename
                              </button>
                              <div style={{ height: '1px', background: '#f3f4f6', margin: '2px 8px' }} />
                              <button onClick={() => handleDeleteColumn(column.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#dc2626', textAlign: 'left' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <IonIcon icon={trashOutline} style={{ fontSize: '14px' }} />
                                Delete List
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Expand */}
                      <button onClick={() => setExpandedColumn(isExpanded ? null : column.id)}
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: isExpanded ? '#6366f1' : '#94a3b8', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <IonIcon icon={expandOutline} style={{ fontSize: '14px' }} />
                      </button>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task}
                        onSelect={() => onSelectTask(task.id)}
                        onDelete={() => deleteTask(task.id)} />
                    ))}
                  </div>

                  {/* Add task */}
                  <button onClick={() => onSelectTask(`new-${column.id}`)}
                    style={{ margin: '8px 10px 10px', padding: '8px', background: 'transparent', border: '1.5px dashed #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}>
                    <IonIcon icon={addOutline} style={{ fontSize: '13px' }} />
                    Add task
                  </button>

                </ColumnContainer>
              </SortableContext>
            );
          })}

          {/* Add new List */}
          <div onClick={onAddList}
            style={{ width: '280px', flexShrink: 0, border: '1.5px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', fontWeight: 600, gap: '6px', transition: 'all 0.15s', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#eef2ff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLDivElement).style.color = '#6366f1'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}>
            <IonIcon icon={addOutline} style={{ fontSize: '16px' }} />
            Add new List
          </div>

        </div>
      </div>

      <DragOverlay>
        {draggedTask ? (
          <div style={{ width: '280px', opacity: 0.9, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
            <TaskCard task={draggedTask} onSelect={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
