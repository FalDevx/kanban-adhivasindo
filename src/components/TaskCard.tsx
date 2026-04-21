import { IonIcon, IonPopover, IonContent } from '@ionic/react';
import {
  calendarOutline,
  checkboxOutline,
  chatbubbleOutline,
  ellipsisVerticalOutline,
  trashOutline,
  createOutline,
} from 'ionicons/icons';
import { Task } from '../types';
import { useRef, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from 'sweetalert2';

interface TaskCardProps {
  task: Task;
  onSelect: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const getLabelMeta = (label: string) => {
  switch (label) {
    case 'Feature': return { bg: '#dbeafe', text: '#2563eb', bar: '#3b82f6' };
    case 'Bug':     return { bg: '#fee2e2', text: '#dc2626', bar: '#ef4444' };
    case 'Issue':   return { bg: '#fef3c7', text: '#d97706', bar: '#f59e0b' };
    default:        return { bg: '#f3f4f6', text: '#6b7280', bar: '#9ca3af' };
  }
};

const completedCount = (task: Task) => task.subtasks.filter((s) => s.completed).length;

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const { deleteTask } = useTaskStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    Swal.fire({
      title: 'Hapus Task?',
      text: 'Task ini akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTask(task.id);
        onDelete(task.id);
      }
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onSelect(task.id);
  };

  const labelMeta = getLabelMeta(task.label);
  const menuId = `menu-btn-${task.id}`;
  const completed = completedCount(task);
  const total = task.subtasks.length;

  return (
    <>
      <div
        ref={setNodeRef}
        className="task-card-wrapper"
        style={{
          ...style,
          borderRadius: '10px',
          background: '#EEF2FF !important' as any,
          backgroundColor: '#EEF2FF',
          border: '1px solid #e2e8f0',
          boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          cursor: 'grab',
        }}
        {...attributes}
        {...listeners}
      >
        {/* Clickable area */}
        <div onClick={() => onSelect(task.id)} style={{ cursor: 'pointer' }}>

          {/* Cover Image */}
          {task.coverImage && (
            <div style={{
              width: '100%',
              height: '140px',
              backgroundImage: `url(${task.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '10px 10px 0 0',
            }} />
          )}

          <div style={{ padding: '12px 12px 10px' }}>
            {/* Label pill + ⋮ menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: '999px',
                  backgroundColor: labelMeta.bg,
                  color: labelMeta.text,
                }}>
                  {task.label}
                </span>
              </div>

              <button
                id={menuId}
                ref={menuBtnRef}
                style={{
                  background: 'none', border: 'none', padding: '2px 4px',
                  cursor: 'pointer', color: '#94a3b8', display: 'flex',
                  alignItems: 'center', borderRadius: '4px', flexShrink: 0,
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
              >
                <IonIcon icon={ellipsisVerticalOutline} style={{ fontSize: '15px', pointerEvents: 'none' }} />
              </button>
            </div>

            {/* Color bar under label */}
            <div style={{
              height: '3px',
              borderRadius: '2px',
              backgroundColor: labelMeta.bar,
              marginBottom: '10px',
              width: '100%',
            }} />

            {/* Title */}
            <h3 style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#1e293b',
              margin: '0 0 10px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {task.title}
            </h3>

            {/* Footer row: due date + subtasks + comments + assignees */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              {/* Left: meta info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {task.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                    <IonIcon icon={calendarOutline} style={{ fontSize: '12px' }} />
                    {task.dueDate}
                  </span>
                )}
                {total > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                    <IonIcon icon={checkboxOutline} style={{ fontSize: '12px' }} />
                    {completed}/{total}
                  </span>
                )}
                {task.comments > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                    <IonIcon icon={chatbubbleOutline} style={{ fontSize: '12px' }} />
                    {task.comments}
                  </span>
                )}
              </div>

              {/* Right: assignee avatars */}
              {task.assignees.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    <div
                      key={assignee.id}
                      title={assignee.name}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        backgroundColor: assignee.color,
                        border: '2px solid #EEF2FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 700, color: '#fff',
                        marginLeft: index === 0 ? 0 : '-8px',
                        zIndex: 10 - index, position: 'relative',
                      }}
                    >
                      {assignee.initials}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      backgroundColor: '#e2e8f0', border: '2px solid #EEF2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 700, color: '#64748b',
                      marginLeft: '-8px', position: 'relative', zIndex: 5,
                    }}>
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <IonPopover
        isOpen={showMenu}
        onDidDismiss={() => setShowMenu(false)}
        trigger={menuId}
        triggerAction="click"
        side="bottom"
        alignment="end"
      >
        <IonContent>
          <div style={{ padding: '4px', minWidth: '140px' }}>
            <button
              onClick={handleEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '9px 14px', background: 'none',
                border: 'none', borderRadius: '6px', color: '#374151',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
            >
              <IonIcon icon={createOutline} style={{ fontSize: '15px', color: '#6366f1', flexShrink: 0 }} />
              Edit
            </button>
            <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '2px 8px' }} />
            <button
              onClick={handleDelete}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '9px 14px', background: 'none',
                border: 'none', borderRadius: '6px', color: '#dc2626',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
            >
              <IonIcon icon={trashOutline} style={{ fontSize: '15px', flexShrink: 0 }} />
              Delete
            </button>
          </div>
        </IonContent>
      </IonPopover>
    </>
  );
};
