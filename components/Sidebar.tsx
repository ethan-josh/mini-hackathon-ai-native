'use client';

import { Task } from '@/lib/supabase/types';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { type LocalTask } from '@/lib/utils/taskStorage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  archivedTasks: Task[];
  carryOverTasks: Task[];
  upcomingTasks: LocalTask[];
}

export default function Sidebar({
  isOpen,
  onClose,
  archivedTasks,
  carryOverTasks,
  upcomingTasks,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'archive' | 'carryover' | 'upcoming'>('archive');

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'archive'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Archive ({archivedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('carryover')}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'carryover'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overdue ({carryOverTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingTasks.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'archive' ? (
            <div className="space-y-3">
              {archivedTasks.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">
                  No archived tasks yet.
                </p>
              ) : (
                archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="font-medium text-gray-900 line-through">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="mt-1 text-sm text-gray-600 line-through">
                        {task.description}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      Completed on {format(parseISO(task.updated_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'carryover' ? (
            <div className="space-y-3">
              {carryOverTasks.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">
                  No overdue tasks.
                </p>
              ) : (
                carryOverTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-red-300 bg-red-50/50 p-3"
                  >
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="mt-1 text-sm text-gray-600">
                        {task.description}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-red-700">
                      From {format(parseISO(task.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">
                  No upcoming tasks.
                </p>
              ) : (
                upcomingTasks.map((task) => {
                  let dueDateDisplay = '';
                  if (task.due_date) {
                    try {
                      const dueDate = parseISO(task.due_date);
                      dueDateDisplay = format(dueDate, 'MMM d, yyyy');
                    } catch {
                      dueDateDisplay = task.due_date;
                    }
                  }
                  
                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-blue-300 bg-blue-50/50 p-3"
                    >
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="mt-1 text-sm text-gray-600">
                          {task.description}
                        </div>
                      )}
                      {dueDateDisplay && (
                        <div className="mt-2 text-xs font-medium text-blue-700">
                          Due: {dueDateDisplay}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

