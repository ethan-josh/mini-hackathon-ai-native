'use client';

import { type LocalTask, deleteActiveTask } from '@/lib/utils/taskStorage';
import { useState } from 'react';

interface TaskItemProps {
  task: LocalTask;
  onUpdate: () => void;
  onSelect?: (taskId: string, selected: boolean) => void;
  isSelected?: boolean;
}

export default function TaskItem({ task, onUpdate, onSelect, isSelected }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleSelect = () => {
    onSelect?.(task.id, !isSelected);
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      deleteActiveTask(task.id);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        isSelected
          ? 'border-blue-300 bg-blue-50/50 ring-2 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected || false}
        onChange={handleToggleSelect}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {task.title}
        </div>
        {task.description && (
          <div className="mt-1 text-sm text-gray-600">
            {task.description}
          </div>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
        title="Delete task"
      >
        <svg
          className="h-5 w-5 text-gray-400 hover:text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

