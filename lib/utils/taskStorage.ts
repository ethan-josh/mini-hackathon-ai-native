import { Task } from '@/lib/supabase/types';
import { format } from 'date-fns';

const STORAGE_KEY = 'active_tasks';
const APP_STATE_KEY = 'app_state';

export interface LocalTask {
  id: string;
  title: string;
  description: string | null;
  created_date: string;
  created_at: string;
  due_date: string | null;
  ai_suggestions: string[];
}

export interface AppState {
  last_viewed_date: string;
}

/**
 * Get all active tasks from localStorage
 */
export function getActiveTasks(): LocalTask[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const tasks = stored ? JSON.parse(stored) : [];
    // Ensure backward compatibility - add missing fields
    return tasks.map((task: any) => ({
      ...task,
      due_date: task.due_date || null,
      ai_suggestions: task.ai_suggestions || [],
    }));
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Save a task to localStorage
 */
export function saveActiveTask(task: LocalTask): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Delete a task from localStorage
 */
export function deleteActiveTask(taskId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
  }
}

/**
 * Update a task in localStorage
 */
export function updateActiveTask(taskId: string, updates: Partial<LocalTask>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error('Error updating localStorage:', error);
  }
}

/**
 * Delete multiple tasks from localStorage
 */
export function deleteActiveTasks(taskIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const filtered = tasks.filter((t) => !taskIds.includes(t.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting tasks from localStorage:', error);
  }
}

/**
 * Get app state from localStorage
 */
export function getAppState(): AppState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(APP_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading app state from localStorage:', error);
    return null;
  }
}

/**
 * Save app state to localStorage
 */
export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state to localStorage:', error);
  }
}

/**
 * Convert LocalTask to Task format for API
 */
export function localTaskToTask(localTask: LocalTask, status: 'accomplished' | 'carry_over' = 'accomplished'): Omit<Task, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: localTask.title,
    description: localTask.description,
    status,
    created_date: localTask.created_date,
    due_date: localTask.due_date || null,
  };
}

/**
 * Create a new task ID
 */
export function createTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add an AI suggestion to a task
 */
export function addAISuggestion(taskId: string, suggestion: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    
    if (index >= 0) {
      const task = tasks[index];
      const suggestions = task.ai_suggestions || [];
      // Avoid duplicates
      if (!suggestions.includes(suggestion)) {
        tasks[index] = {
          ...task,
          ai_suggestions: [...suggestions, suggestion],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }
    }
  } catch (error) {
    console.error('Error adding AI suggestion:', error);
  }
}

/**
 * Remove an AI suggestion from a task
 */
export function removeAISuggestion(taskId: string, suggestionIndex: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tasks = getActiveTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    
    if (index >= 0) {
      const task = tasks[index];
      const suggestions = task.ai_suggestions || [];
      const newSuggestions = suggestions.filter((_, i) => i !== suggestionIndex);
      tasks[index] = {
        ...task,
        ai_suggestions: newSuggestions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error('Error removing AI suggestion:', error);
  }
}

