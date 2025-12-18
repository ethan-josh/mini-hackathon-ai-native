'use client';

import { Task } from '@/lib/supabase/types';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  onSelect?: (task: Task) => void;
  isSelected?: boolean;
}

export default function TaskItem({ task, onUpdate, onSelect, isSelected }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    const newStatus = task.status === 'accomplished' ? 'active' : 'accomplished';
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update task');
      }

      onUpdate();
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(`Failed to update task: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete task');
      }

      onUpdate();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert(`Failed to delete task: ${error.message || 'Please try again.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const isCarryOver = task.status === 'carry_over';
  const isAccomplished = task.status === 'accomplished';

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        isCarryOver
          ? 'border-amber-300 bg-amber-50/50'
          : isAccomplished
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <input
        type="checkbox"
        checked={isAccomplished}
        onChange={handleToggleComplete}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <div
        className="flex-1 cursor-pointer"
        onClick={() => onSelect?.(task)}
      >
        <div
          className={`font-medium ${
            isAccomplished ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}
        >
          {task.title}
        </div>
        {task.description && (
          <div
            className={`mt-1 text-sm ${
              isAccomplished ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {task.description}
          </div>
        )}
        {isCarryOver && (
          <div className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Carried Over
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

