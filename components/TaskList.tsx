'use client';

import { Task } from '@/lib/supabase/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
  onTaskSelect?: (task: Task) => void;
  selectedTaskId?: string | null;
}

export default function TaskList({
  tasks,
  onUpdate,
  onTaskSelect,
  selectedTaskId,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onSelect={onTaskSelect}
          isSelected={selectedTaskId === task.id}
        />
      ))}
    </div>
  );
}

