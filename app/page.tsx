'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/supabase/types';
import { format, subDays, parseISO, isAfter, startOfToday } from 'date-fns';
import { getActiveTasks, type LocalTask, getAppState, saveAppState, updateActiveTask } from '@/lib/utils/taskStorage';
import { checkAndCarryOverTasks } from '@/lib/utils/carryOver';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';
import CalendarView from '@/components/CalendarView';

export default function Home() {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [carryOverTasks, setCarryOverTasks] = useState<LocalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadTasks = async () => {
    try {
      // First, check and carry over tasks if needed
      await checkAndCarryOverTasks();

      // Load active tasks from localStorage
      const activeTasks = getActiveTasks();
      // Filter to today's tasks
      const todayTasks = activeTasks.filter((t) => t.created_date === today);

      // Fetch carry-over tasks from database to identify which are carry-over
      try {
        const carryOverResponse = await fetch('/api/tasks?status=carry_over');
        const carryOverResult = await carryOverResponse.json();
        const dbCarryOverTasks = carryOverResponse.ok ? (carryOverResult.data || []) : [];

        // Match database carry-over tasks with localStorage tasks
        // Match by title and description (since we don't have IDs linking them)
        const carryOverTaskTitles = new Set(
          dbCarryOverTasks.map((t: Task) => `${t.title}|${t.description || ''}`)
        );

        const newTasks: LocalTask[] = [];
        const carryOverLocalTasks: LocalTask[] = [];

        todayTasks.forEach((task) => {
          const taskKey = `${task.title}|${task.description || ''}`;
          if (carryOverTaskTitles.has(taskKey)) {
            carryOverLocalTasks.push(task);
          } else {
            newTasks.push(task);
          }
        });

        setTasks(newTasks);
        setCarryOverTasks(carryOverLocalTasks);
      } catch (error) {
        // If we can't fetch carry-over tasks, just show all as new tasks
        console.error('Error fetching carry-over tasks:', error);
        setTasks(todayTasks);
        setCarryOverTasks([]);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Listen for task updates (e.g., when AI suggestions are added)
  useEffect(() => {
    const handleTaskUpdate = () => {
      loadTasks();
    };
    window.addEventListener('taskUpdated', handleTaskUpdate);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdate);
  }, []);

  const simulateNextDay = async () => {
    if (!confirm('Simulate next day? This will carry over all uncompleted tasks from today.')) {
      return;
    }

    try {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const todayStr = format(new Date(), 'yyyy-MM-dd');

      // Get all active tasks from localStorage
      const activeTasks = getActiveTasks();
      
      // Find all tasks that were created today (these are the ones to carry over)
      const tasksToCarryOver = activeTasks.filter(
        (task) => task.created_date === todayStr
      );

      if (tasksToCarryOver.length === 0) {
        alert('No tasks to carry over. All tasks are already from previous days.');
        return;
      }

      // Step 1: Update tasks' created_date to yesterday (simulating they were from yesterday)
      tasksToCarryOver.forEach((task) => {
        updateActiveTask(task.id, { created_date: yesterday });
      });

      // Step 2: Set last_viewed_date to yesterday
      saveAppState({ last_viewed_date: yesterday });

      // Step 3: Trigger carry-over logic (which will find tasks from yesterday and carry them over)
      await checkAndCarryOverTasks();

      // Step 4: Reload tasks
      await loadTasks();

      alert(`Next day simulated! ${tasksToCarryOver.length} task(s) have been carried over.`);
    } catch (error) {
      console.error('Error simulating next day:', error);
      alert('Error simulating next day. Please check the console.');
    }
  };

  // Fetch all archived and carry-over tasks for sidebar
  const [allArchivedTasks, setAllArchivedTasks] = useState<Task[]>([]);
  const [allCarryOverTasks, setAllCarryOverTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<LocalTask[]>([]);

  const fetchSidebarTasks = async () => {
    let dbOverdueTasks: Task[] = [];
    
    try {
      const [archivedResponse, carryOverResponse] = await Promise.all([
        fetch('/api/tasks?status=accomplished'),
        fetch('/api/tasks?status=carry_over'),
      ]);

      const archivedResult = await archivedResponse.json();
      const carryOverResult = await carryOverResponse.json();

      if (archivedResponse.ok) {
        setAllArchivedTasks(archivedResult.data || []);
      }
      if (carryOverResponse.ok) {
        dbOverdueTasks = carryOverResult.data || [];
      }
    } catch (error) {
      console.error('Error fetching sidebar tasks:', error);
    }

    // Fetch overdue and upcoming tasks from localStorage
    const allTasks = getActiveTasks();
    const today = startOfToday();
    
    // Get overdue tasks (tasks with due_date in the past)
    const overdue = allTasks
      .filter((task) => {
        if (!task.due_date) return false;
        try {
          const dueDate = parseISO(task.due_date);
          const dueDateOnly = new Date(dueDate);
          dueDateOnly.setHours(0, 0, 0, 0);
          const todayOnly = new Date(today);
          todayOnly.setHours(0, 0, 0, 0);
          return dueDateOnly.getTime() < todayOnly.getTime();
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0;
        try {
          const dateA = parseISO(a.due_date);
          const dateB = parseISO(b.due_date);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });
    
    // Get upcoming tasks (tasks with due_date in the future)
    const upcoming = allTasks
      .filter((task) => {
        if (!task.due_date) return false;
        try {
          const dueDate = parseISO(task.due_date);
          return isAfter(dueDate, today);
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0;
        try {
          const dateA = parseISO(a.due_date);
          const dateB = parseISO(b.due_date);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });
    
    // Combine database overdue tasks with localStorage overdue tasks
    // Convert LocalTask to Task format for consistency
    const overdueAsTasks: Task[] = overdue.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: 'carry_over' as const,
      created_date: task.created_date,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.created_at,
    }));
    
    const allOverdueTasks = [...dbOverdueTasks, ...overdueAsTasks];
    // Remove duplicates based on title and description
    const uniqueOverdueTasks = Array.from(
      new Map(
        allOverdueTasks.map((task: any) => [
          `${task.title}|${task.description || ''}`,
          task
        ])
      ).values()
    );
    setAllCarryOverTasks(uniqueOverdueTasks as Task[]);
    setUpcomingTasks(upcoming);
  };

  useEffect(() => {
    if (sidebarOpen) {
      fetchSidebarTasks();
    }
  }, [sidebarOpen]);

  // Refresh sidebar tasks when tasks are updated
  useEffect(() => {
    const handleTaskUpdate = () => {
      if (sidebarOpen) {
        fetchSidebarTasks();
      }
    };
    window.addEventListener('taskUpdated', handleTaskUpdate);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdate);
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Simulate Next Day Button */}
      <button
        onClick={simulateNextDay}
        className="fixed bottom-6 left-6 z-30 flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-amber-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        title="Simulate next day to test carry-over functionality"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Simulate Next Day
      </button>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
            <p className="mt-1 text-sm text-gray-600">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg
                className="mr-2 inline-block h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {showCalendar ? 'List View' : 'Calendar'}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg
                className="mr-2 inline-block h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              History
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={loadTasks} />

        {/* Calendar View */}
        {showCalendar && (
          <div className="mb-8">
            <CalendarView tasks={[...tasks, ...carryOverTasks]} onUpdate={loadTasks} />
          </div>
        )}

        {/* Overdue Tasks Section */}
        {carryOverTasks.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-red-300"></div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Overdue Tasks ({carryOverTasks.length})
              </h2>
              <div className="h-px flex-1 bg-red-300"></div>
            </div>
            <div className="rounded-lg border-2 border-red-300 bg-red-50/30 p-4">
              <TaskList tasks={carryOverTasks} onUpdate={loadTasks} />
            </div>
          </div>
        )}

        {/* New Tasks Section */}
        {!showCalendar && (
        <div>
          {carryOverTasks.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-300"></div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Today's New Tasks ({tasks.length})
              </h2>
              <div className="h-px flex-1 bg-gray-300"></div>
            </div>
          )}
          <TaskList tasks={tasks} onUpdate={loadTasks} />
        </div>
        )}

        {/* AI Assistant */}
        <AIAssistant activeTasks={[...tasks, ...carryOverTasks]} />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          archivedTasks={allArchivedTasks}
          carryOverTasks={allCarryOverTasks}
          upcomingTasks={upcomingTasks}
        />
      </div>
    </div>
  );
}
