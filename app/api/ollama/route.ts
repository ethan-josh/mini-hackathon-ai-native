import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task } = body;

    if (!task) {
      return NextResponse.json(
        { error: 'Task data is required' },
        { status: 400 }
      );
    }

    // Construct prompt for the AI
    const prompt = `You are a helpful task assistant. The user has a task: "${task.title}"${task.description ? ` - ${task.description}` : ''}. 

Please provide helpful suggestions for this task. For example:
- Break it down into smaller sub-steps if it's complex
- Suggest how to approach it
- Provide relevant tips or resources

Be concise and actionable.`;

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

