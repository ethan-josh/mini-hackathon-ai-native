'use client';

import { Task } from '@/lib/supabase/types';
import { useState } from 'react';

interface AIAssistantProps {
  selectedTask: Task | null;
}

export default function AIAssistant({ selectedTask }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAIHelp = async () => {
    if (!selectedTask) {
      setError('Please select a task first by clicking on it.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: selectedTask }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get AI response');
      }

      const data = await res.json();
      setResponse(data.response || 'No response received.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title="AI Assistant"
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Assistant
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

            <div className="max-h-[60vh] overflow-y-auto p-6">
              {selectedTask ? (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700">
                    Selected Task:
                  </div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {selectedTask.title}
                  </div>
                  {selectedTask.description && (
                    <div className="mt-1 text-sm text-gray-600">
                      {selectedTask.description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Please select a task from the list to get AI assistance.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              {response && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    AI Suggestions:
                  </div>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {response}
                  </div>
                </div>
              )}

              <button
                onClick={handleGetAIHelp}
                disabled={isLoading || !selectedTask}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Getting AI help...' : 'Get AI Help'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

