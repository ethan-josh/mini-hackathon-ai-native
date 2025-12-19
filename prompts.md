*Prompts used in Local-First Task Tracker Project*

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

### Prompt 2

```
For database, maybe use supabase
```

### Prompt 3

```
Project id = omslhyvpgpvtcejxpogu
ANON_KEY = 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tc2xoeXZwZ3B2dGNlanhwb2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTEwMDEsImV4cCI6MjA4MTQyNzAwMX0.JaRKo27XppsojOgQyyD36h49Du2GuCaxUWjFWSi763E
```

### Prompt 4

```
## Error Type
Console Error

## Error Message
Error adding task: {}

    at createConsoleError (file:///Users/ethanjoshua.camingao/Documents/AI Native/mini-hackathon-ai-native/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js:2189:71)
    at handleConsoleError (file:///Users/ethanjoshua.camingao/Documents/AI Native/mini-hackathon-ai-native/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js:2970:54)
    at console.error (file:///Users/ethanjoshua.camingao/Documents/AI Native/mini-hackathon-ai-native/.next/dev/static/chunks/node_modules_next_dist_7a8122d0._.js:3114:57)
    at handleSubmit (file:///Users/ethanjoshua.camingao/Documents/AI Native/mini-hackathon-ai-native/.next/dev/static/chunks/_d12f13b4._.js:127:21)

Next.js version: 16.0.10 (Turbopack)
```

### Prompt 5

```
https://omslhyvpgpvtcejxpogu.supabase.co 

(index):1 Access to fetch at 'https://omslhyvpgpvtcejxpogu.supabase.co/rest/v1/tasks' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
omslhyvpgpvtcejxpogu….co/rest/v1/tasks:1 
 Failed to load resource: net::ERR_FAILED
intercept-console-error.ts:42 Supabase error: 
Object
error	@	intercept-console-error.ts:42
Error adding task: 
Object
error	@	intercept-console-error.ts:42
```

### Prompt 6

```
Adding a task is now ok! However, when i try to select the check button

invalid input syntax for type uuid: "undefined"
Call Stack
1

handleToggleComplete
file:///Users/ethanjoshua.camingao/Documents/AI%20Native/mini-hackathon-ai-native/.next/dev/static/chunks/_d12f13b4._.js (31:23)

I get this error
```

### Prompt 7

```
I do not need it to keep pushing tasks to the database.

I only need it to push tasks to the database when they are done or when they need to be carried over for the next day.

Additionally, whenever a task is created and I click the checkbox, it brings the task to archive. Rather, I want to be able to select multiple tasks and click a button that says: Mark as Done before heading to archive.

Additionally, the AI button does not seem to have visibility on all tasks
```

### Prompt 8

```
In the AI chat, I want to be able to talk to AI. Have a chat function. And at the same time, let AI have context of all pending tasks.

KEep the part Active Tasks (number), so that I as a user will know what context the AI sees. But I want to be able to chat to the AI to give it more specific prompts
```

### Prompt 9

```
I want to be able to select what task the AI can see. SO in the chat box, have a tick box on which task I can ask AI about.

For example, I mark the tick box of task A in the chat, so AI will have context over that but not task B.

If I mark both Task A and Task B, AI will have context of both tasks when I chat
```

### Prompt 10

```
Have a clear history button to avoid AI from hallucinating or mixing up tasks.

Also have a clear chat button
```

### Prompt 11

```
I want to have speech-to-text, wherein I talk to the AI so i dont have to type out my queries. 

No need for text-to-speech.
```

### Prompt 12

```
I want to simulate carry over. Can you have a button on the lower left that will simulate the next day just so that I know the caryy over functionality is working
```

### Prompt 13

```
put carry over tasks in a different section from the new/day tasks to add emphasis
```

### Prompt 14

```
Simulate next day does not seem to work. When I click it, the tasks are still in current tasks not the carryover separated section
```

### Prompt 15

```
I have to models installed now, 

GXCHLAP00388:~ ethanjoshua.camingao$ ollama list
NAME            ID              SIZE      MODIFIED       
llama3.2:1b     baf6a787fdff    1.3 GB    17 seconds ago    
qwen2.5:0.5b    a8b0c5157701    397 MB    16 hours ago   

How would you tell the webapp to use llama3.2:1b instead of qwen?
```

### Prompt 16

```
Even with only one task selected, AI says that are previous tasks when there are none.

Improve the prompt
```

### Prompt 17

```
I want to add improvements to this. I want to be able to do the following:
1. For each task, have a date assigned to them like when the task needs to be done by.
2. Have a calendar feature. Where user can see all tasks for the next days.
3. Other than the carry-over tab, there will be a 'upcoming tasks' tab that have tasks that are still to come
4. Whenever AI will make a suggestion to a particular task, there should be a button "Add suggestion" button beside each chat of the AI for the user to add that suggestion to the task. In the row form, maybe have a larger button beside the trash button that a user can toggle to show the saved AI suggestion for that particular task
```

### Prompt 18

```
Things to fix:

1. As I click add suggestion in the chat, I am not seeing it reflect in the particular task. I was thinking a button on the task that when I click will open a floating window with the saved suggestion
2. Rename carry-overs to overdue
3. Insread of AI seeing all tasks across the week, revert it back to only selected ones. But add an option wherein it says "Weekly tasks" for AI to see and have context of all the weekly tasks and their dates.
```

### Prompt 19

```
Fix history not updating even if there are upcoming and overdue tasks
```

### Prompt 20

```
anyhting i should change in the supabase table?
```

