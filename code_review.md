## Code Review

### Prompt 1

```
Build a "Local-First Task Tracker" using Next.js (App Router) and Tailwind CSS. 

### Core Concept:
A daily task manager that runs on localhost and uses a local Ollama instance (qwen2.5:0.5b) for AI assistance.

### Key Logic: "The Carry-Over System"
- Instead of a midnight cron job, implement a "Last Opened" check.
- When the app loads, compare the current date with the `last_viewed_date` stored in the local database (use SQLite with Prisma or simple LocalStorage for now).
- If the date has changed, any tasks from the previous date that are NOT marked "accomplished" must be updated to a status of "Carry Over" and moved to the current day's list.

### Features:
1. **Task Management:** Simple UI to add, delete, and toggle completion of tasks.
2. **AI Assistant Button:** A floating action button at the bottom.
   - When clicked, it sends the current list of tasks to `http://localhost:11434/api/generate`.
   - Use the `qwen2.5:0.5b` model.
   - The AI should help generate content based on the tasks (e.g., writing an email for a task or breaking a task into sub-steps).
3. **Optimized UI:** Keep it clean, fast, and minimalist. Use a sidebar for "Archive" and "Carry Over" history.

### Technical Details:
- Framework: Next.js (latest)
- Styling: Tailwind CSS
- State Management: React Hooks
- AI Integration: Fetch API calls to Ollama's local port (11434). Ensure you handle CORS if necessary or use a Next.js API route as a proxy.

Please start by scaffolding the project structure. Whenever you run commands please run this command prior: eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Changes made:

- __app/layout.tsx [edited]__
  
This file was edited to update metadata with the app title and description.

- __app/page.tsx [added]__
  
This is the main page component that displays the task list, handles carry-over logic, and manages task state.

- __app/api/ollama/route.ts [added]__
  
This file provides a Next.js API route proxy for Ollama, handling CORS and forwarding requests to the local Ollama instance.

- __app/api/tasks/route.ts [added]__
  
This file provides API routes (GET, POST) for fetching and creating tasks in Supabase.

- __app/api/tasks/[id]/route.ts [added]__
  
This file provides API routes (PATCH, DELETE) for updating and deleting individual tasks.

- __app/api/tasks/batch/route.ts [added]__
  
This file provides a batch insert API route for saving multiple tasks at once (used for marking tasks as done or carrying them over).

- __app/api/carryover/route.ts [added]__
  
This file provides an API route for triggering the carry-over process.

- __components/AddTaskForm.tsx [added]__
  
This component provides a form to add new tasks with title and description fields.

- __components/TaskItem.tsx [added]__
  
This component displays individual task items with checkbox for selection, delete button, and visual indicators for carry-over status.

- __components/TaskList.tsx [added]__
  
This component manages the task list display, multi-select functionality, and "Mark as Done" button.

- __components/Sidebar.tsx [added]__
  
This component provides a sidebar with Archive and Carry Over sections to view task history.

- __components/AIAssistant.tsx [added]__
  
This component provides the AI assistant chat interface with floating action button, task selection checkboxes, and chat functionality.

- __lib/supabase/client.ts [added]__
  
This file initializes the Supabase client with environment variables.

- __lib/supabase/types.ts [added]__
  
This file defines TypeScript types for the database schema (Task, AppState, Database).

- __lib/utils/carryOver.ts [added]__
  
This file implements the carry-over logic that checks date changes and moves uncompleted tasks to the current day.

- __lib/utils/taskStorage.ts [added]__
  
This file provides utility functions for managing tasks in localStorage, including getActiveTasks, saveActiveTask, deleteActiveTask, updateActiveTask, and conversion utilities.

- __supabase-setup.sql [added]__
  
This file contains SQL scripts to set up the Supabase database schema, including tasks and app_state tables, indexes, triggers, and RLS policies.

- __.env.local [added]__
  
This file stores Supabase credentials (URL and anon key) for environment configuration.

- __README.md [added]__
  
This file provides project documentation including setup instructions, features, and project structure.

---

### Prompt 2

```
For database, maybe use supabase
```

### Changes made:

- __app/page.tsx [edited]__
  
This file was edited to use Supabase API routes instead of direct database calls.

- __lib/supabase/client.ts [added]__
  
This file was added to configure Supabase client integration.

- __lib/supabase/types.ts [added]__
  
This file was added to define TypeScript types for Supabase database schema.

- __supabase-setup.sql [added]__
  
This file was added with SQL scripts for Supabase database setup.

---

### Prompt 3

```
Project id = omslhyvpgpvtcejxpogu
ANON_KEY = 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc2xoeXZwZ3B2dGNlanhwb2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTEwMDEsImV4cCI6MjA4MTQyNzAwMX0.JaRKo27XppsojOgQyyD36h49Du2GuCaxUWjFWSi763E
```

### Changes made:

- __.env.local [edited]__
  
This file was updated with the provided Supabase project ID and anon key.

---

### Prompt 4

```
## Error Type
Console Error

## Error Message
Error adding task: {}
```

### Changes made:

- __components/AddTaskForm.tsx [edited]__
  
This file was edited to improve error handling with detailed error messages, including error codes and helpful hints for common issues like missing database tables or permission errors.

---

### Prompt 5

```
Access to fetch at 'https://omslhyvpgpvtcejxpogu.supabase.co/rest/v1/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Changes made:

- __app/api/tasks/route.ts [added]__
  
This file was added to create server-side API routes that proxy Supabase requests, avoiding CORS issues by running on the same origin as the Next.js app.

- __app/api/tasks/[id]/route.ts [added]__
  
This file was added to provide server-side API routes for updating and deleting tasks, avoiding CORS issues.

- __app/api/carryover/route.ts [added]__
  
This file was added to provide a server-side API route for carry-over operations.

- __components/AddTaskForm.tsx [edited]__
  
This file was edited to use the new API routes instead of direct Supabase client calls.

- __components/TaskItem.tsx [edited]__
  
This file was edited to use the new API routes instead of direct Supabase client calls.

- __app/page.tsx [edited]__
  
This file was edited to use the new API routes instead of direct Supabase client calls.

---

### Prompt 6

```
invalid input syntax for type uuid: "undefined"
```

### Changes made:

- __app/api/tasks/[id]/route.ts [edited]__
  
This file was edited to properly await the params Promise in Next.js 16, fixing the UUID extraction issue by changing params type from `{ id: string }` to `Promise<{ id: string }>` and awaiting it before use.

---

### Prompt 7

```
I do not need it to keep pushing tasks to the database.

I only need it to push tasks to the database when they are done or when they need to be carried over for the next day.

Additionally, whenever a task is created and I click the checkbox, it brings the task to archive. Rather, I want to be able to select multiple tasks and click a button that says: Mark as Done before heading to archive.

Additionally, the AI button does not seem to have visibility on all tasks
```

### Changes made:

- __lib/utils/taskStorage.ts [added]__
  
This file was added to provide localStorage management utilities for active tasks, including functions to get, save, delete, and update tasks locally without database writes.

- __components/AddTaskForm.tsx [edited]__
  
This file was edited to save new tasks to localStorage instead of directly to the database.

- __components/TaskItem.tsx [edited]__
  
This file was edited to change checkboxes from completion toggle to selection toggle, removing immediate database updates.

- __components/TaskList.tsx [edited]__
  
This file was edited to add multi-select state management and a "Mark as Done" button that appears when tasks are selected, which saves selected tasks to the database and removes them from localStorage.

- __lib/utils/carryOver.ts [edited]__
  
This file was edited to work with localStorage instead of database, reading active tasks from localStorage and saving carry-over tasks to the database when date changes.

- __app/page.tsx [edited]__
  
This file was edited to load active tasks from localStorage on mount, filter to today's tasks, and handle the separation between new and carry-over tasks.

- __components/AIAssistant.tsx [edited]__
  
This file was edited to receive all active tasks instead of a single selected task, showing all tasks in the modal for AI context.

- __app/api/ollama/route.ts [edited]__
  
This file was edited to accept an array of tasks instead of a single task, updating the prompt to include all tasks context.

---

### Prompt 8

```
In the AI chat, I want to be able to talk to AI. Have a chat function. And at the same time, let AI have context of all pending tasks.

Keep the part Active Tasks (number), so that I as a user will know what context the AI sees. But I want to be able to chat to the AI to give it more specific prompts
```

### Changes made:

- __components/AIAssistant.tsx [edited]__
  
This file was edited to add a full chat interface with conversation history, message bubbles for user and assistant, chat input with send button, and auto-scroll functionality. The Active Tasks display was kept visible at the top.

- __app/api/ollama/route.ts [edited]__
  
This file was edited to handle conversation history, maintaining context across multiple messages and always including active tasks context in each request.

---

### Prompt 9

```
I want to be able to select what task the AI can see. SO in the chat box, have a tick box on which task I can ask AI about.

For example, I mark the tick box of task A in the chat, so AI will have context over that but not task B.

If I mark both Task A and Task B, AI will have context of both tasks when I chat
```

### Changes made:

- __components/AIAssistant.tsx [edited]__
  
This file was edited to add checkboxes next to each task in the Active Tasks section, allowing users to select which tasks the AI can see. Added state management for selected task IDs and updated the API call to only send selected tasks.

---

### Prompt 10

```
Have a clear history button to avoid AI from hallucinating or mixing up tasks.

Also have a clear chat button
```

### Changes made:

- __components/AIAssistant.tsx [edited]__
  
This file was edited to add a "Clear History" button in the header (visible when messages exist) and a "Clear Chat" button above the input area, both clearing conversation history with confirmation dialogs.

---

### Prompt 11

```
I want to have speech-to-text, wherein I talk to the AI so i dont have to type out my queries. 

No need for text-to-speech.
```

### Changes made:

- __components/AIAssistant.tsx [edited]__
  
This file was edited to add speech-to-text functionality using the Web Speech API. Added a microphone button inside the textarea, real-time transcription with interim results, visual feedback (red pulsing when listening), and proper error handling for microphone permissions.

---

### Prompt 12

```
I want to simulate carry over. Can you have a button on the lower left that will simulate the next day just so that I know the carry over functionality is working
```

### Changes made:

- __app/page.tsx [edited]__
  
This file was edited to add a "Simulate Next Day" button in the lower left corner that sets last_viewed_date to yesterday and triggers the carry-over logic for testing purposes.

---

### Prompt 13

```
put carry over tasks in a different section from the new/day tasks to add emphasis
```

### Changes made:

- __app/page.tsx [edited]__
  
This file was edited to separate carry-over tasks from new tasks into distinct sections. Added logic to fetch carry-over tasks from the database and match them with localStorage tasks, displaying them in separate sections with different styling (amber/orange for carry-over, standard gray for new tasks) and clear section headers with icons.

---

### Prompt 14

```
Simulate next day does not seem to work. When I click it, the tasks are still in current tasks not the carryover separated section
```

### Changes made:

- __app/page.tsx [edited]__
  
This file was edited to fix the simulate next day function. The issue was that tasks had today's date but carry-over logic looks for yesterday's date. The fix updates all today's tasks to have yesterday's date first, then sets last_viewed_date to yesterday, then triggers carry-over which finds them and processes them correctly.

- __lib/utils/taskStorage.ts [import added]__
  
Added import for updateActiveTask function to support the simulate functionality.

---

### Prompt 15

```
I have to models installed now, 

How would you tell the webapp to use llama3.2:1b instead of qwen?
```

### Changes made:

- __app/api/ollama/route.ts [edited]__
  
This file was edited to change the model from 'qwen2.5:0.5b' to 'llama3.2:1b' in the Ollama API request.

---

### Prompt 16

```
Even with only one task selected, AI says that are previous tasks when there are none.

Improve the prompt
```

### Changes made:

- __app/api/ollama/route.ts [edited]__
  
This file was edited to improve the prompt with better task count handling (singular/plural), explicit instructions to only focus on listed tasks, and clearer messaging to prevent AI from assuming other tasks exist.

---

### Prompt 17

```
I want to add improvements to this. I want to be able to do the following:
1. For each task, have a date assigned to them like when the task needs to be done by.
2. Have a calendar feature. Where user can see all tasks for the next days.
3. Other than the carry-over tab, there will be a 'upcoming tasks' tab that have tasks that are still to come
4. Whenever AI will make a suggestion to a particular task, there should be a button "Add suggestion" button beside each chat of the AI for the user to add that suggestion to the task. In the row form, maybe have a larger button beside the trash button that a user can toggle to show the saved AI suggestion for that particular task
```

### Changes made:

- __lib/utils/taskStorage.ts [edited]__
  
This file was edited to add `due_date` and `ai_suggestions` fields to the LocalTask interface, and added helper functions `addAISuggestion()` and `removeAISuggestion()` for managing AI suggestions per task. Updated `getActiveTasks()` to ensure backward compatibility with default values.

- __components/AddTaskForm.tsx [edited]__
  
This file was edited to add an optional date picker input for due date selection when creating tasks.

- __components/TaskItem.tsx [edited]__
  
This file was edited to display due dates with color coding (red for overdue, amber for today/tomorrow, gray for future), added a toggle button to show/hide AI suggestions inline, and display saved suggestions with delete functionality.

- __components/CalendarView.tsx [added]__
  
This file was added to create a weekly calendar component showing tasks grouped by due date, with navigation between weeks and a section for tasks without due dates.

- __app/page.tsx [edited]__
  
This file was edited to add calendar view toggle button, integrate CalendarView component, and pass upcoming tasks to Sidebar.

- __components/Sidebar.tsx [edited]__
  
This file was edited to add a third "Upcoming Tasks" tab showing tasks with future due dates, sorted by date.

- __components/AIAssistant.tsx [edited]__
  
This file was edited to update ChatMessage interface to track selectedTaskIds and messageId, add "Add Suggestion" button to each assistant message, and implement suggestion saving logic that saves to selected tasks.

- __app/api/ollama/route.ts [edited]__
  
This file was edited to include due dates in task context and build weekly calendar context when allTasks are provided.

---

### Prompt 18

```
Things to fix:

1. As I click add suggestion in the chat, I am not seeing it reflect in the particular task. I was thinking a button on the task that when I click will open a floating window with the saved suggestion
2. Rename carry-overs to overdue
3. Insread of AI seeing all tasks across the week, revert it back to only selected ones. But add an option wherein it says "Weekly tasks" for AI to see and have context of all the weekly tasks and their dates.
```

### Changes made:

- __components/TaskItem.tsx [edited]__
  
This file was edited to replace inline suggestion display with a floating modal window. Added a lightbulb button with badge count that opens a modal showing all saved suggestions, with individual delete functionality.

- __components/AIAssistant.tsx [edited]__
  
This file was edited to add a "Weekly tasks" checkbox toggle that controls whether AI receives full weekly calendar context. Reverted default behavior to only show selected tasks, with weekly context as optional. Added custom event dispatch to trigger task refresh when suggestions are added.

- __app/page.tsx [edited]__
  
This file was edited to listen for taskUpdated events and refresh sidebar when tasks change. Updated all UI text from "Carry Over" to "Overdue" and changed color scheme from amber to red for overdue tasks.

- __components/Sidebar.tsx [edited]__
  
This file was edited to rename "Carry Over" tab to "Overdue" and update styling from amber to red theme.

---

### Prompt 19

```
Fix history not updating even if there are upcoming and overdue tasks
```

### Changes made:

- __app/page.tsx [edited]__
  
This file was edited to fix the fetchSidebarTasks function to check localStorage for overdue tasks (tasks with past due dates) in addition to database tasks. Combined database and localStorage overdue tasks, removing duplicates. Added event listeners to automatically refresh sidebar when tasks are added, modified, or deleted.

- __components/AddTaskForm.tsx [edited]__
  
This file was edited to dispatch taskUpdated event when tasks are added to trigger sidebar refresh.

- __components/TaskList.tsx [edited]__
  
This file was edited to dispatch taskUpdated event when tasks are marked as done to trigger sidebar refresh.

---

### Prompt 20

```
anyhting i should change in the supabase table?
```

### Changes made:

- No code changes required. The database schema already supports all features:
  - `due_date` field already exists in the tasks table
  - `ai_suggestions` are stored in localStorage only (not in database)
  - `carry_over` status in database is fine (UI displays as "Overdue")
  - Optional: Added recommendation for `due_date` index for better query performance

