import { NextResponse } from 'next/server';
import { checkAndCarryOverTasks } from '@/lib/utils/carryOver';

export async function POST() {
  try {
    await checkAndCarryOverTasks();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to carry over tasks' },
      { status: 500 }
    );
  }
}

