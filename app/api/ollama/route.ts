import { NextRequest, NextResponse } from 'next/server';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, allTasks, messages } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      );
    }

    // Construct tasks context with due dates
    const tasksList = tasks.length > 0
      ? tasks
          .map((task: any, index: number) => {
            let taskLine = `${index + 1}. ${task.title}`;
            if (task.description) {
              taskLine += ` - ${task.description}`;
            }
            if (task.due_date) {
              try {
                const dueDate = parseISO(task.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDateOnly = new Date(dueDate);
                dueDateOnly.setHours(0, 0, 0, 0);
                
                if (dueDateOnly.getTime() < today.getTime()) {
                  taskLine += ` [OVERDUE: Due ${format(dueDate, 'MMM d, yyyy')}]`;
                } else if (isSameDay(dueDate, today)) {
                  taskLine += ` [Due TODAY - ${format(dueDate, 'MMM d, yyyy')}]`;
                } else {
                  taskLine += ` [Due ${format(dueDate, 'MMM d, yyyy')}]`;
                }
              } catch {
                taskLine += ` [Due: ${task.due_date}]`;
              }
            }
            return taskLine;
          })
          .join('\n')
      : 'No active tasks.';

    // Build weekly calendar context from all tasks (only if provided)
    let calendarContext = '';
    if (allTasks && Array.isArray(allTasks) && allTasks.length > 0) {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      
      // Group tasks by due date
      const tasksByDate: { [key: string]: any[] } = {};
      const tasksWithoutDate: any[] = [];
      
      allTasks.forEach((task: any) => {
        if (task.due_date) {
          try {
            const dueDate = parseISO(task.due_date);
            const dateKey = format(dueDate, 'yyyy-MM-dd');
            if (!tasksByDate[dateKey]) {
              tasksByDate[dateKey] = [];
            }
            tasksByDate[dateKey].push(task);
          } catch {
            tasksWithoutDate.push(task);
          }
        } else {
          tasksWithoutDate.push(task);
        }
      });
      
      calendarContext = '\n\n=== WEEKLY CALENDAR VIEW ===\n';
      calendarContext += `Current Week: ${format(weekStart, 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}\n\n`;
      
      // Show tasks for each day of the week
      weekDays.forEach((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayTasks = tasksByDate[dateKey] || [];
        const isToday = isSameDay(day, today);
        const dayLabel = isToday ? `${format(day, 'EEE, MMM d')} (TODAY)` : format(day, 'EEE, MMM d');
        
        if (dayTasks.length > 0) {
          calendarContext += `${dayLabel}:\n`;
          dayTasks.forEach((task: any) => {
            calendarContext += `  - ${task.title}${task.description ? `: ${task.description}` : ''}\n`;
          });
        } else {
          calendarContext += `${dayLabel}: No tasks\n`;
        }
      });
      
      // Show tasks without due dates
      if (tasksWithoutDate.length > 0) {
        calendarContext += `\nTasks without due date (${tasksWithoutDate.length}):\n`;
        tasksWithoutDate.forEach((task: any) => {
          calendarContext += `  - ${task.title}${task.description ? `: ${task.description}` : ''}\n`;
        });
      }
      
      // Summary statistics
      const totalTasksWithDates = Object.values(tasksByDate).flat().length;
      calendarContext += `\nCalendar Summary: ${totalTasksWithDates} task(s) with due dates, ${tasksWithoutDate.length} task(s) without due dates\n`;
    }

    // Build conversation context
    let conversationContext = '';
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Include conversation history
      conversationContext = messages
        .map((msg: any) => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');
    }

    // Construct the full prompt with tasks context and conversation
    const taskCount = tasks.length;
    const taskWord = taskCount === 1 ? 'task' : 'tasks';
    const taskListWord = taskCount === 1 ? 'task' : 'tasks';
    
    let prompt = `You are a helpful task assistant. The user has selected ${taskCount} ${taskWord} for this conversation:

${tasksList}

IMPORTANT: Only focus on the ${taskListWord} listed above. Do not reference or assume there are other tasks beyond what is shown here.`;

    // Add weekly calendar context if provided
    if (calendarContext) {
      prompt += `\n\n=== WEEKLY CALENDAR CONTEXT (for reference only) ===\n${calendarContext}\n\nYou can reference this weekly calendar context to understand how the selected tasks fit into the broader schedule, but focus your responses on the selected tasks above.`;
    }

    if (conversationContext) {
      prompt += `\n\nConversation history:\n${conversationContext}\n\nPlease respond to the user's latest message, focusing only on the ${taskListWord} listed above.`;
    } else {
      // First message - provide general help
      const lastMessage = messages && messages.length > 0 
        ? messages[messages.length - 1]?.content 
        : 'How can I help you with your tasks?';
      
      prompt += `\n\nUser's message: ${lastMessage}\n\nPlease provide helpful assistance. You can:
- Answer questions about the ${taskListWord} listed above${calendarContext ? ' and how they relate to the weekly calendar' : ''}
- Help with specific task-related requests${calendarContext ? ', considering the full weekly schedule' : ''}
- Provide guidance on how to approach or complete the ${taskListWord}${calendarContext ? ', taking into account due dates and calendar context' : ''}
${calendarContext ? '- Suggest scheduling adjustments or task prioritization based on the weekly view\n- Reference any tasks from the calendar when relevant to the conversation' : ''}

Be concise, actionable, and helpful.${calendarContext ? ' You have access to the weekly calendar context above and can reference it when relevant.' : ' Only reference the tasks that are explicitly listed above.'}`;
    }

    // Forward request to local Ollama instance
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    return NextResponse.json({ response: data.response || data });
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Make sure Ollama is running on localhost:11434' },
      { status: 500 }
    );
  }
}

