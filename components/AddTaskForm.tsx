'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface AddTaskFormProps {
  onTaskAdded: () => void;
}

export default function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status: 'active',
          created_date: today,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add task');
      }

      setTitle('');
      setDescription('');
      onTaskAdded();
    } catch (error: any) {
      console.error('Error adding task:', error);
      const errorMessage = error?.message || 'Unknown error';
      
      // Provide helpful error messages based on common issues
      let userMessage = errorMessage;
      if (errorMessage?.includes('relation') || errorMessage?.includes('does not exist')) {
        userMessage = 'Database tables not found. Please run the SQL setup script in Supabase (see supabase-setup.sql)';
      } else if (errorMessage?.includes('permission') || errorMessage?.includes('policy')) {
        userMessage = 'Permission denied. Please check your Supabase RLS policies.';
      }

      alert(`Failed to add task: ${userMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}

