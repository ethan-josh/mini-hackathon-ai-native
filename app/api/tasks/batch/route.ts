import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      );
    }

    // Insert all tasks in a batch
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasks as any)
      .select();

    if (error) {
      console.error('Supabase batch insert error:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create tasks' },
      { status: 500 }
    );
  }
}

