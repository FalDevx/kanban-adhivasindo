import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonCheckbox,
  IonProgressBar,
} from '@ionic/react';
import {
  closeOutline,
  checkmarkOutline,
  imageOutline,
  pencilOutline,
  addOutline,
  cloudUploadOutline,
  checkmarkCircleOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import { Task, Subtask } from '../types';
import { useState, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  task,
  onClose,
}) => {
  const { updateTask, addTask, getTaskById } = useTaskStore();
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      const existing = getTaskById(editedTask.id);
      if (!existing) {
        addTask(editedTask);
      } else {
        updateTask(editedTask);
      }
      onClose();
    }
  };

  const handleCoverImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setEditedTask({
          ...editedTask,
          coverImage: imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubtask = () => {
    const newSubtask: Subtask = {
      id: Math.random().toString(),
      title: 'New subtask',
      completed: false,
    };
    setEditedTask({
      ...editedTask,
      subtasks: [...editedTask.subtasks, newSubtask],
    });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const handleUpdateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, title: newTitle } : s
      ),
    });
  };

  const completedSubtasks = editedTask.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = editedTask.subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="modal-fullscreen">
      <IonHeader className="border-b border-gray-200">
        <IonToolbar className="bg-white">
          <IonButtons slot="start">
            <IonButton color="primary" onClick={handleSave}>
              <IonIcon slot="icon-only" icon={checkmarkOutline} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton color="medium" onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <div className="flex h-full bg-gray-50">
        {/* Left Panel (45%) */}
        <div className="w-5/12 border-r border-gray-300 bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Mark Complete Button */}
            <IonButton fill="outline" color="success" expand="block">
              <IonIcon slot="start" icon={checkmarkOutline} />
              Mark Complete
            </IonButton>

            {/* Cover Image */}
            <div>
              {editedTask.coverImage ? (
                <div className="relative mb-3">
                  <img
                    src={editedTask.coverImage}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={handleCoverImageClick}
                  />
                  <button
                    onClick={() => setEditedTask({ ...editedTask, coverImage: null })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleCoverImageClick}
                  className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition mb-3"
                >
                  <div className="text-center">
                    <IonIcon icon={imageOutline} className="text-3xl text-gray-500 mb-1" />
                    <p className="text-xs text-blue-600 font-medium">Add Cover Image</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    title: e.target.value,
                  })
                }
                className="text-xl font-bold text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 outline-none w-full pb-2"
                placeholder="Task title"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                ASSIGNEES
              </label>
              <div className="flex items-center gap-2">
                {editedTask.assignees.map((assignee) => (
                  <IonAvatar
                    key={assignee.id}
                    className="w-6 h-6 text-white text-xs font-bold"
                    style={{ backgroundColor: assignee.color }}
                  >
                    {assignee.initials}
                  </IonAvatar>
                ))}
                <button className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">
                  +
                </button>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                DUE DATE
              </label>
              <input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    dueDate: e.target.value,
                  })
                }
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Board */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                BOARD
              </label>
              <select className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2">
                <option>Adhivasindo</option>
              </select>
            </div>

            {/* Column */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                COLUMN
              </label>
              <select
                value={editedTask.columnId}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    columnId: e.target.value,
                  })
                }
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="rework">Rework</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                LABEL
              </label>
              <select
                value={editedTask.label}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    label: e.target.value as any,
                  })
                }
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
              >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Issue">Issue</option>
                <option value="Undefined">Undefined</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                PRIORITY
              </label>
              <select
                value={editedTask.priority}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    priority: e.target.value as any,
                  })
                }
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                NOTES
              </label>
              <textarea
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    description: e.target.value,
                  })
                }
                placeholder="Add notes..."
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2 h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Panel (55%) */}
        <div className="w-7/12 bg-gray-50 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Description
              </h3>
              <div className="bg-white p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
                {editedTask.description || 'No description yet.'}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IonIcon icon={cloudUploadOutline} className="text-lg" />
                Attachments
              </h3>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                <IonIcon icon={cloudUploadOutline} className="text-3xl text-gray-400 mb-1 block" />
                <p className="text-xs text-gray-600">
                  Drop files or{' '}
                  <span className="text-blue-600 font-medium">browse</span>
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IonIcon icon={checkmarkCircleOutline} className="text-lg" />
                Check List
              </h3>

              {totalSubtasks > 0 && (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">
                        {completedSubtasks}/{totalSubtasks}
                      </span>
                    </div>
                    <IonProgressBar
                      value={progressPercentage / 100}
                      color="primary"
                    />
                  </div>

                  <div className="space-y-2 mb-4 bg-white p-3 rounded">
                    {editedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleToggleSubtask(subtask.id)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={subtask.title}
                          onChange={(e) => handleUpdateSubtaskTitle(subtask.id, e.target.value)}
                          className={`flex-1 text-xs bg-transparent border-0 outline-none ${
                            subtask.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-700'
                          }`}
                        />
                        <button
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={handleAddSubtask}
                className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1"
              >
                <IonIcon icon={addOutline} className="text-sm" />
                Add subtask
              </button>
            </div>

            {/* Activity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IonIcon icon={chatbubbleOutline} className="text-lg" />
                Activity
              </h3>
              <div className="bg-white rounded-lg p-6 text-center">
                <IonIcon icon={chatbubbleOutline} className="text-3xl text-gray-300 mb-1 block" />
                <p className="text-xs text-gray-600">No recent activity</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <IonButton fill="outline" color="medium" expand="block" onClick={onClose}>
                Discard
              </IonButton>
              <IonButton fill="solid" color="primary" expand="block" onClick={handleSave}>
                Save Changes
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};
