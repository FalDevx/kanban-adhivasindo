import {
  IonAvatar,
  IonIcon,
  IonPopover,
  IonContent,
} from '@ionic/react';
import {
  calendarOutline,
  checkmarkCircleOutline,
  chatbubbleOutline,
  ellipsisVerticalOutline,
  trashOutline,
} from 'ionicons/icons';
import { Task } from '../types';
import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onSelect: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const labelColors: Record<string, string> = {
  Feature: 'bg-blue-500 text-white',
  Bug: 'bg-red-500 text-white',
  Issue: 'bg-amber-500 text-white',
  Undefined: 'bg-gray-400 text-white',
};

const completedSubtasks = (task: Task) =>
  task.subtasks.filter((s) => s.completed).length;

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { deleteTask } = useTaskStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) {
      deleteTask(task.id);
      onDelete(task.id);
      setShowMenu(false);
    }
  };

  const getLabelColor = (label: string): string => {
    switch (label) {
      case 'Feature':
        return '#3b82f6';
      case 'Bug':
        return '#ef4444';
      case 'Issue':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative bg-white rounded border border-gray-200 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden group"
      onClick={() => onSelect(task.id)}
    >
      {/* Cover Image */}
      {task.coverImage && (
        <div
          className="w-full h-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${task.coverImage})` }}
        />
      )}

      <div className="p-2.5">
        {/* Label and Menu */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${labelColors[task.label]}`}>
            {task.label.toUpperCase()}
          </span>
          <button
            id={`menu-${task.id}`}
            className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(true);
            }}
          >
            <IonIcon icon={ellipsisVerticalOutline} className="text-lg" />
          </button>
        </div>

        {/* Task Title */}
        <h3 className="font-semibold text-gray-900 text-xs line-clamp-2 mb-1.5">
          {task.title}
        </h3>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-gray-600 text-xs mb-1.5">
            <IonIcon icon={calendarOutline} className="text-xs" />
            <span className="text-xs">{task.dueDate}</span>
          </div>
        )}

        {/* Subtasks and Comments */}
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
              {completedSubtasks(task)}/{task.subtasks.length}
            </span>
          )}
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5">
              <IonIcon icon={chatbubbleOutline} className="text-xs" />
              {task.comments}
            </span>
          )}
        </div>

        {/* Assignees */}
        {task.assignees.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="w-5 h-5 rounded-full border-1.5 border-white flex items-center justify-center text-xs font-bold text-white pointer-events-none"
                style={{ backgroundColor: assignee.color, zIndex: 3 - index }}
                title={assignee.name}
              >
                {assignee.initials}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Border */}
      <div
        className="h-1"
        style={{ backgroundColor: getLabelColor(task.label) }}
      />

      {/* Context Menu */}
      <IonPopover
        isOpen={showMenu}
        onDidDismiss={() => setShowMenu(false)}
        trigger={`menu-${task.id}`}
        side="bottom"
      >
        <IonContent className="w-40">
          <div className="p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded text-xs font-medium"
            >
              <IonIcon icon={trashOutline} className="text-base" />
              Delete
            </button>
          </div>
        </IonContent>
      </IonPopover>
    </div>
  );
};
