import { IonIcon } from '@ionic/react';
import { addOutline, ellipsisVerticalOutline } from 'ionicons/icons';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './TaskCard';
import { Column } from '../types/index';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

interface BoardProps {
  onSelectTask: (taskId: string) => void;
  columns: Column[];
}

export const Board: React.FC<BoardProps> = ({ onSelectTask, columns }) => {
  const { getTasks, deleteTask, getTaskById, updateTask } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTaskId(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = getTaskById(taskId);
    if (!task) return;

    // Check if over is a column container or another task
    let newColumnId = over.id as string;

    // If over is a task ID, find its column
    const overTask = getTaskById(newColumnId);
    if (overTask) {
      newColumnId = overTask.columnId;
    }

    // Update task if column changed
    if (task.columnId !== newColumnId) {
      updateTask({
        ...task,
        columnId: newColumnId,
      });
    }
  };

  const draggedTask = draggedTaskId ? getTaskById(draggedTaskId) : null;

  const ColumnContainer = ({ columnId, children }: { columnId: string; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: columnId,
    });

    return (
      <div
        ref={setNodeRef}
        className="w-80 flex-shrink-0 bg-column-bg rounded border border-gray-200 flex flex-col min-h-96 transition-all duration-200 hover:shadow-sm"
        style={{
          backgroundColor: isOver ? '#f0fdf4' : undefined,
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto bg-board-bg">
        <div className="inline-flex gap-4 p-6 min-h-full">
          {columns.map((column) => {
            const tasks = getTasks(column.id);
            const taskIds = tasks.map((t) => t.id);

            return (
              <SortableContext
                key={column.id}
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                <ColumnContainer columnId={column.id}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900 text-sm">
                        {column.title}
                      </h2>
                      <span className="bg-gray-300 text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectTask(`new-${column.id}`)}
                        className="p-1.5 hover:bg-gray-300 rounded transition"
                        title="Add task"
                      >
                        <IonIcon
                          icon={addOutline}
                          className="text-gray-600 text-lg"
                        />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-300 rounded transition"
                        title="Column options"
                      >
                        <IonIcon
                          icon={ellipsisVerticalOutline}
                          className="text-gray-600 text-lg"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onSelect={() => onSelectTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </div>

                  {/* Add Task Button */}
                  <button
                    onClick={() => onSelectTask(`new-${column.id}`)}
                    className="mx-3 mb-3 py-1.5 text-gray-600 hover:text-gray-900 text-xs font-medium border-2 border-dashed border-gray-300 rounded hover:border-gray-400 hover:bg-gray-100 transition"
                  >
                    + Add task
                  </button>
                </ColumnContainer>
              </SortableContext>
            );
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedTask ? (
          <div className="w-80 opacity-90 drop-shadow-xl">
            <TaskCard
              task={draggedTask}
              onSelect={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
