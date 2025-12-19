'use client';

import { type LocalTask, getActiveTasks, deleteActiveTasks, localTaskToTask } from '@/lib/utils/taskStorage';
import { useState } from 'react';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: LocalTask[];
  onUpdate: () => void;
}

export default function TaskList({ tasks, onUpdate }: TaskListProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleMarkAsDone = async () => {
    if (selectedTaskIds.size === 0) return;

    setIsMarkingDone(true);
    try {
      const allTasks = getActiveTasks();
      const tasksToMark = allTasks.filter((t) => selectedTaskIds.has(t.id));

      // Convert to Task format and save to database
      const tasksToSave = tasksToMark.map((t) => localTaskToTask(t, 'accomplished'));

      const response = await fetch('/api/tasks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: tasksToSave }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to mark tasks as done');
      }

      // Remove from localStorage
      deleteActiveTasks(Array.from(selectedTaskIds));
      setSelectedTaskIds(new Set());
      onUpdate();
      // Trigger sidebar refresh if open
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (error: any) {
      console.error('Error marking tasks as done:', error);
      alert(`Failed to mark tasks as done: ${error.message || 'Please try again.'}`);
    } finally {
      setIsMarkingDone(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedTaskIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleMarkAsDone}
            disabled={isMarkingDone}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMarkingDone ? 'Marking...' : 'Mark as Done'}
          </button>
        </div>
      )}
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onSelect={handleTaskSelect}
          isSelected={selectedTaskIds.has(task.id)}
        />
      ))}
    </div>
  );
}

