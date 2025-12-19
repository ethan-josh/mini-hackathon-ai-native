'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { type LocalTask } from '@/lib/utils/taskStorage';
import TaskItem from './TaskItem';

interface CalendarViewProps {
  tasks: LocalTask[];
  onUpdate: () => void;
}

export default function CalendarView({ tasks, onUpdate }: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.due_date === dateStr);
  };

  const getTasksWithoutDate = () => {
    return tasks.filter((task) => !task.due_date);
  };

  const tasksWithoutDate = getTasksWithoutDate();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goToNextWeek}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="text-lg font-semibold text-gray-900">
          {format(weekStart, 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`rounded-lg border p-3 ${
                isToday ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="mb-2">
                <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayTasks.length > 0 ? (
                  <>
                    <div className="text-xs text-gray-600 mb-1">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </div>
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="truncate rounded bg-white px-2 py-1 text-xs text-gray-700 border border-gray-200"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-gray-400">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks without due date */}
      {tasksWithoutDate.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Tasks without due date ({tasksWithoutDate.length})
          </h3>
          <div className="space-y-2">
            {tasksWithoutDate.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

