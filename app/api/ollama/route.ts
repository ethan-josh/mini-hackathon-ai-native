import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, messages } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      );
    }

    // Construct tasks context
    const tasksList = tasks.length > 0
      ? tasks
          .map((task: any, index: number) => {
            return `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''}`;
          })
          .join('\n')
      : 'No active tasks.';

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
    let prompt = `You are a helpful task assistant. The user has the following active tasks:

${tasksList}

You should always be aware of these tasks when responding.`;

    if (conversationContext) {
      prompt += `\n\nConversation history:\n${conversationContext}\n\nPlease respond to the user's latest message, keeping in mind their active tasks.`;
    } else {
      // First message - provide general help
      const lastMessage = messages && messages.length > 0 
        ? messages[messages.length - 1]?.content 
        : 'How can I help you with your tasks?';
      
      prompt += `\n\nUser's message: ${lastMessage}\n\nPlease provide helpful assistance. You can:
- Break down complex tasks into smaller sub-steps
- Suggest prioritization strategies
- Provide tips on how to approach tasks efficiently
- Identify dependencies or relationships between tasks
- Answer questions about the tasks
- Help with specific task-related requests

Be concise, actionable, and helpful.`;
    }

    // Forward request to local Ollama instance
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:0.5b',
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

