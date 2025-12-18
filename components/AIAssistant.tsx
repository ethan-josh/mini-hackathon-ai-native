'use client';

import { type LocalTask } from '@/lib/utils/taskStorage';
import { useState, useRef, useEffect } from 'react';

interface AIAssistantProps {
  activeTasks: LocalTask[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant({ activeTasks }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize selected tasks to all tasks when modal opens or tasks change
  useEffect(() => {
    if (isOpen && activeTasks.length > 0) {
      setSelectedTaskIds((prev) => {
        // If no tasks are selected, select all by default
        if (prev.size === 0) {
          return new Set(activeTasks.map((t) => t.id));
        }
        // Update selection to only include tasks that still exist
        const newSet = new Set<string>();
        activeTasks.forEach((task) => {
          if (prev.has(task.id)) {
            newSet.add(task.id);
          }
        });
        // If no tasks remain selected, select all
        return newSet.size > 0 ? newSet : new Set(activeTasks.map((t) => t.id));
      });
    }
  }, [isOpen, activeTasks]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectedTasks = activeTasks.filter((task) => selectedTaskIds.has(task.id));

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading || selectedTasks.length === 0) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to chat
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: selectedTasks,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get AI response');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'No response received.',
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the user message if there was an error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
          <div className="fixed left-1/2 top-1/2 z-50 flex h-[80vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 transform flex-col rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Assistant
                </h3>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Clear conversation history? This will start a fresh conversation.')) {
                          setMessages([]);
                          setError(null);
                        }
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Clear conversation history"
                    >
                      Clear History
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setMessages([]);
                      setError(null);
                      setSelectedTaskIds(new Set());
                    }}
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
            </div>

            {/* Active Tasks Context with Checkboxes */}
            <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
              {activeTasks.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Select tasks for AI context ({selectedTasks.length} of {activeTasks.length} selected):
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {activeTasks.map((task) => {
                      const isSelected = selectedTaskIds.has(task.id);
                      return (
                        <label
                          key={task.id}
                          className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTaskToggle(task.id)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="font-semibold">{task.title}</span>
                          {task.description && (
                            <span className="text-gray-500 truncate max-w-[200px]">
                              - {task.description}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-amber-800">
                  No active tasks available. Add some tasks first!
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-2">Start a conversation with your AI assistant!</p>
                  <p className="text-sm">
                    {selectedTasks.length > 0
                      ? `The AI has context of ${selectedTasks.length} selected task${selectedTasks.length > 1 ? 's' : ''} and can help you manage them.`
                      : 'Select tasks above to give the AI context.'}
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-100 px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">
                  {messages.length > 0 && `${messages.length} message${messages.length > 1 ? 's' : ''} in conversation`}
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear chat? This will remove all messages and start fresh.')) {
                        setMessages([]);
                        setError(null);
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                    title="Clear chat messages"
                  >
                    Clear Chat
                  </button>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedTasks.length === 0
                      ? 'Select at least one task above to chat...'
                      : 'Type your message... (Press Enter to send, Shift+Enter for new line)'
                  }
                  rows={2}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  disabled={isLoading || selectedTasks.length === 0}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim() || selectedTasks.length === 0}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

