# Local-First Task Tracker

A daily task manager that runs on localhost and uses a local Ollama instance for AI assistance. Features a smart carry-over system that automatically moves uncompleted tasks to the current day when the date changes.

## Features

- **Task Management**: Add, delete, and toggle completion of tasks
- **Carry-Over System**: Uncompleted tasks automatically move to the current day when the date changes
- **AI Assistant**: Get AI-powered suggestions for tasks using local Ollama instance (qwen2.5:0.5b)
- **History Sidebar**: View archived tasks and carry-over history
- **Clean UI**: Minimalist, modern interface built with Tailwind CSS

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** installed and running locally
3. **Supabase** account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-setup.sql` to create the necessary tables and policies

### 3. Configure Environment Variables

The `.env.local` file should already be configured with your Supabase credentials. If not, create it:

```env
NEXT_PUBLIC_SUPABASE_URL=https://omslhyvpgpvtcejxpogu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Start Ollama (if not already running)

Make sure Ollama is running and the `qwen2.5:0.5b` model is available:

```bash
# Pull the model if you haven't already
ollama pull qwen2.5:0.5b

# Start Ollama (usually runs on localhost:11434)
ollama serve
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Carry-Over System

When you open the app:
1. The system checks the `last_viewed_date` from the database
2. If the date has changed since your last visit:
   - All uncompleted tasks from the previous day are marked as "carry_over"
   - Their `created_date` is updated to today's date
   - They appear in both today's main list and the "Carry Over" sidebar section

### AI Assistant

- Click on any task to select it
- Click the floating AI Assistant button (bottom-right)
- The AI will provide suggestions, break down complex tasks, or help with task-related content

## Project Structure

```
├── app/
│   ├── api/
│   │   └── ollama/
│   │       └── route.ts          # Ollama API proxy
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page with task list
│   └── globals.css               # Global styles
├── components/
│   ├── AddTaskForm.tsx           # Form to add new tasks
│   ├── AIAssistant.tsx           # AI assistant modal
│   ├── Sidebar.tsx               # History sidebar
│   ├── TaskItem.tsx              # Individual task component
│   └── TaskList.tsx              # Task list container
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase client
│   │   └── types.ts              # TypeScript types
│   └── utils/
│       └── carryOver.ts          # Carry-over logic
└── supabase-setup.sql            # Database setup script
```

## Technologies Used

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL database)
- **Ollama** (Local AI model)
- **date-fns** (Date utilities)

## Notes

- The app uses Supabase's anonymous key, so all data is accessible to anyone with the key. For production use, implement proper authentication.
- Make sure Ollama is running on `localhost:11434` for the AI assistant to work.
- The carry-over system only triggers when you open the app, not automatically at midnight.
