'use client';

import { type LocalTask, deleteActiveTask, removeAISuggestion } from '@/lib/utils/taskStorage';
import { useState } from 'react';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';

interface TaskItemProps {
  task: LocalTask;
  onUpdate: () => void;
  onSelect?: (taskId: string, selected: boolean) => void;
  isSelected?: boolean;
}

export default function TaskItem({ task, onUpdate, onSelect, isSelected }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

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

  const handleDeleteSuggestion = (index: number) => {
    try {
      removeAISuggestion(task.id, index);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting suggestion:', error);
      alert('Failed to delete suggestion. Please try again.');
    }
  };

  const getDueDateColor = () => {
    if (!task.due_date) return 'text-gray-500';
    
    try {
      const dueDate = parseISO(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        return 'text-red-600 font-semibold';
      } else if (isToday(dueDate) || isTomorrow(dueDate)) {
        return 'text-amber-600 font-medium';
      } else {
        return 'text-gray-600';
      }
    } catch {
      return 'text-gray-500';
    }
  };

  const formatDueDate = () => {
    if (!task.due_date) return null;
    
    try {
      const dueDate = parseISO(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isToday(dueDate)) {
        return 'Due today';
      } else if (isTomorrow(dueDate)) {
        return 'Due tomorrow';
      } else if (isPast(dueDate)) {
        return `Overdue: ${format(dueDate, 'MMM d, yyyy')}`;
      } else {
        return format(dueDate, 'MMM d, yyyy');
      }
    } catch {
      return task.due_date;
    }
  };

  const suggestions = task.ai_suggestions || [];

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
        {task.due_date && (
          <div className={`mt-1 text-xs ${getDueDateColor()}`}>
            {formatDueDate()}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {suggestions.length > 0 && (
          <button
            onClick={() => setShowSuggestionsModal(true)}
            className="opacity-0 transition-opacity group-hover:opacity-100 p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 relative"
            title="View AI suggestions"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {suggestions.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                {suggestions.length}
              </span>
            )}
          </button>
        )}
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

      {/* Suggestions Modal */}
      {showSuggestionsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSuggestionsModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Suggestions for "{task.title}"
                </h3>
                <button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-6">
              {suggestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No AI suggestions saved for this task yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="group/suggestion relative rounded-lg border border-blue-200 bg-blue-50/50 p-4"
                    >
                      <div className="pr-8 text-sm text-gray-700 whitespace-pre-wrap">
                        {suggestion}
                      </div>
                      <button
                        onClick={() => {
                          handleDeleteSuggestion(index);
                          if (suggestions.length === 1) {
                            setShowSuggestionsModal(false);
                          }
                        }}
                        className="absolute right-2 top-2 rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                        title="Delete suggestion"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

