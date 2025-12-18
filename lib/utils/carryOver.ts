import { format, isSameDay, parseISO } from 'date-fns';
import { supabase } from '../supabase/client';
import { Task } from '../supabase/types';

/**
 * Checks if the date has changed since last view and carries over uncompleted tasks
 */
export async function checkAndCarryOverTasks(): Promise<void> {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Get or create app state
  const { data: appStateData, error: appStateError } = await supabase
    .from('app_state')
    .select('*')
    .limit(1)
    .single();

  if (appStateError && appStateError.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is expected on first run
    console.error('Error fetching app state:', appStateError);
    return;
  }

  let lastViewedDate: string | null = null;

  if (appStateData) {
    lastViewedDate = appStateData.last_viewed_date;
  }

  // If no last viewed date or dates are different, carry over tasks
  if (!lastViewedDate || !isSameDay(parseISO(lastViewedDate), today)) {
    if (lastViewedDate) {
      // Find all uncompleted tasks from the previous date
      const { data: tasksToCarryOver, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_date', lastViewedDate)
        .neq('status', 'accomplished');

      if (tasksError) {
        console.error('Error fetching tasks to carry over:', tasksError);
        return;
      }

      if (tasksToCarryOver && tasksToCarryOver.length > 0) {
        // Update tasks to carry_over status and move to today
        const taskIds = tasksToCarryOver.map((task) => task.id);
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            status: 'carry_over',
            created_date: todayStr,
            updated_at: new Date().toISOString(),
          })
          .in('id', taskIds);

        if (updateError) {
          console.error('Error updating tasks:', updateError);
          return;
        }
      }
    }

    // Update or create app state with today's date
    if (appStateData) {
      await supabase
        .from('app_state')
        .update({
          last_viewed_date: todayStr,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appStateData.id);
    } else {
      await supabase.from('app_state').insert({
        last_viewed_date: todayStr,
      });
    }
  }
}

