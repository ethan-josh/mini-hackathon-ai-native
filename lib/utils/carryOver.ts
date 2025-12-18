import { format, isSameDay, parseISO } from 'date-fns';
import {
  getActiveTasks,
  getAppState,
  saveAppState,
  localTaskToTask,
  updateActiveTask,
} from './taskStorage';

/**
 * Checks if the date has changed since last view and carries over uncompleted tasks
 * This function works with localStorage for active tasks
 */
export async function checkAndCarryOverTasks(): Promise<void> {
  if (typeof window === 'undefined') return;

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Get app state from localStorage
  const appState = getAppState();
  const lastViewedDate = appState?.last_viewed_date || null;

  // If no last viewed date or dates are different, carry over tasks
  if (!lastViewedDate || !isSameDay(parseISO(lastViewedDate), today)) {
    if (lastViewedDate) {
      // Get all active tasks from localStorage
      const activeTasks = getActiveTasks();
      
      // Filter tasks from the previous date
      const tasksToCarryOver = activeTasks.filter(
        (task) => task.created_date === lastViewedDate
      );

      if (tasksToCarryOver.length > 0) {
        // Convert to Task format and save to database with carry_over status
        const tasksToSave = tasksToCarryOver.map((t) => localTaskToTask(t, 'carry_over'));

        try {
          // Save to database
          const response = await fetch('/api/tasks/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks: tasksToSave }),
          });

          if (!response.ok) {
            console.error('Error saving carry-over tasks to database');
            return;
          }

          // Update tasks in localStorage to today's date
          tasksToCarryOver.forEach((task) => {
            updateActiveTask(task.id, { created_date: todayStr });
          });
        } catch (error) {
          console.error('Error carrying over tasks:', error);
          return;
        }
      }
    }

    // Update app state with today's date
    saveAppState({ last_viewed_date: todayStr });
  }
}

