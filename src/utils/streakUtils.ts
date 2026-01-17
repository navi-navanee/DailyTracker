import { getLocalDateString } from './dateUtils';

/**
 * Calculates the current streak based on completed dates.
 * A streak is maintained if the habit was completed today or yesterday.
 * 
 * @param completedDates Array of date strings (YYYY-MM-DD or ISO strings that start with it)
 * @returns number Current streak count
 */
export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  // Normalize all dates to YYYY-MM-DD
  const normalizedDates = completedDates.map(d => d.split('T')[0]);
  
  // Sort unique dates descending (newest first)
  const uniqueDates = [...new Set(normalizedDates)].sort((a, b) => b.localeCompare(a));
  
  const today = getLocalDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateString(yesterdayDate);

  // Check if streak is active (completed today OR yesterday)
  // If the most recent completion is before yesterday, streak is broken -> 0
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  // We need to check consecutively backwards from the latest completion
  // The latest completion is either today or yesterday (confirmed by check above)
  
  // We need to mimic a continuous chain.
  // 1. Start from the most recent completed date.
  // 2. Look for the day before that.
  
  let currentCheckDate = new Date(uniqueDates[0]); // Start with the most recent completion
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const dateStr = uniqueDates[i];
    const expectedDateStr = getLocalDateString(currentCheckDate);
    
    if (dateStr === expectedDateStr) {
      streak++;
      // Move check to previous day
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      // Gap found, streak ends
      break;
    }
  }

  return streak;
};
