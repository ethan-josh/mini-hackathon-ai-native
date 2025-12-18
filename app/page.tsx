'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/supabase/types';
import { format } from 'date-fns';
import { getActiveTasks, type LocalTask } from '@/lib/utils/taskStorage';
import { checkAndCarryOverTasks } from '@/lib/utils/carryOver';
import AddTaskForm from '@/components/AddTaskForm';
import TaskList from '@/components/TaskList';
import Sidebar from '@/components/Sidebar';
import AIAssistant from '@/components/AIAssistant';

export default function Home() {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadTasks = async () => {
    try {
      // First, check and carry over tasks if needed
      await checkAndCarryOverTasks();

      // Load active tasks from localStorage
      const activeTasks = getActiveTasks();
      // Filter to today's tasks
      const todayTasks = activeTasks.filter((t) => t.created_date === today);
      setTasks(todayTasks);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Fetch all archived and carry-over tasks for sidebar
  const [allArchivedTasks, setAllArchivedTasks] = useState<Task[]>([]);
  const [allCarryOverTasks, setAllCarryOverTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchSidebarTasks = async () => {
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
          setAllCarryOverTasks(carryOverResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching sidebar tasks:', error);
      }
    };

    if (sidebarOpen) {
      fetchSidebarTasks();
    }
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
            <p className="mt-1 text-sm text-gray-600">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
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

        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={loadTasks} />

        {/* Task List */}
        <TaskList tasks={tasks} onUpdate={loadTasks} />

        {/* AI Assistant */}
        <AIAssistant activeTasks={tasks} />

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          archivedTasks={allArchivedTasks}
          carryOverTasks={allCarryOverTasks}
        />
      </div>
    </div>
  );
}
