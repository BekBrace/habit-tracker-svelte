// Define the base Habit interface that represents a habit's core properties
interface Habit {
  id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';  // Specific frequency options
  target: number;                             // Target number of times to complete
  streak: number;                             // Current streak
  category: string;                           // Category/tag for grouping
  created_at: string;
  reminder_time?: string;                     // Optional reminder time
  notes?: string;                             // Optional notes/description
}

// Extend the base Habit interface to include completion status
interface HabitWithCompletion extends Habit {
  completed: boolean;  // Whether the habit has been completed for the current day
}

// Constants for localStorage keys
const STORAGE_KEY = 'habitflow_habits';        // Key for storing the habits array
const COMPLETIONS_KEY = 'habitflow_completions'; // Key for storing completion history

/**
 * Get the current date in YYYY-MM-DD format for tracking daily completions
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Initialize the database by creating empty storage if it doesn't exist
 * This ensures we always have valid JSON to work with
 */
export function initializeDatabase(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(COMPLETIONS_KEY)) {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify({}));
  }
}

/**
 * Retrieve all habits with their current day completion status
 * @returns Array of habits with completion status for the current day
 */
export function getAllHabits(): HabitWithCompletion[] {
  // Get raw data from localStorage
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '{}');
  const todayKey = getTodayKey();

  // Map habits to include completion status
  return habits.map(habit => ({
    ...habit,
    completed: completions[todayKey]?.includes(habit.id) || false
  }));
}

/**
 * Add a new habit to the database
 */
export function addHabit(
  name: string,
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
  target: number = 1,
  category: string = 'general',
  reminder_time?: string,
  notes?: string
): number {
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const newHabit: Habit = {
    id: habits.length ? Math.max(...habits.map(h => h.id)) + 1 : 1,
    name,
    frequency,
    target,
    streak: 0,
    category,
    created_at: new Date().toISOString(),
    reminder_time,
    notes
  };
  
  habits.push(newHabit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  return newHabit.id;
}

/**
 * Delete a habit and its completion history
 * @param id The ID of the habit to delete
 */
export function deleteHabit(id: number): void {
  // Remove the habit from the habits array
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const filteredHabits = habits.filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHabits));

  // Remove all completion records for this habit
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '{}');
  Object.keys(completions).forEach(date => {
    completions[date] = completions[date].filter((habitId: number) => habitId !== id);
  });
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

/**
 * Toggle the completion status of a habit for the current day
 * @param habitId The ID of the habit to toggle
 * @param completed The new completion status
 */
export function toggleHabitCompletion(habitId: number, completed: boolean): void {
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '{}');
  const todayKey = getTodayKey();

  // Initialize today's completions array if it doesn't exist
  if (!completions[todayKey]) {
    completions[todayKey] = [];
  }

  // Add or remove the habit ID from today's completions
  if (completed && !completions[todayKey].includes(habitId)) {
    completions[todayKey].push(habitId);
  } else if (!completed) {
    completions[todayKey] = completions[todayKey].filter((id: number) => id !== habitId);
  }

  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  
  // Update streak after toggling completion
  updateStreak(habitId);
}

/**
 * Calculate and update streak for a habit
 */
export function updateStreak(habitId: number): void {
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '{}');
  const habit = habits.find(h => h.id === habitId);
  
  if (!habit) return;

  const today = new Date();
  let streak = 0;

  // Calculate streak based on frequency
  switch (habit.frequency) {
    case 'daily':
      // Check consecutive days
      let currentDate = new Date(today);
      while (true) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (!completions[dateKey]?.includes(habitId)) break;
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      break;
      
    case 'weekly':
      // Check consecutive weeks
      let currentWeek = getWeekNumber(today);
      let foundCompletion = true;
      while (foundCompletion) {
        foundCompletion = Object.keys(completions).some(date => {
          const dateObj = new Date(date);
          return getWeekNumber(dateObj) === currentWeek && completions[date].includes(habitId);
        });
        if (foundCompletion) {
          streak++;
          currentWeek--;
        }
      }
      break;
      
    case 'monthly':
      // Check consecutive months
      let currentMonth = today.getMonth();
      let currentYear = today.getFullYear();
      let foundMonthCompletion = true;
      while (foundMonthCompletion) {
        foundMonthCompletion = Object.keys(completions).some(date => {
          const dateObj = new Date(date);
          return dateObj.getMonth() === currentMonth && 
                 dateObj.getFullYear() === currentYear && 
                 completions[date].includes(habitId);
        });
        if (foundMonthCompletion) {
          streak++;
          currentMonth--;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
          }
        }
      }
      break;
  }
  
  // Update habit streak
  const index = habits.findIndex(h => h.id === habitId);
  if (index !== -1) {
    habits[index].streak = streak;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }
}

/**
 * Update an existing habit
 */
export function updateHabit(
  id: number,
  updates: Partial<Omit<Habit, 'id' | 'created_at'>>
): void {
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const index = habits.findIndex(h => h.id === id);
  
  if (index !== -1) {
    habits[index] = {
      ...habits[index],
      ...updates
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }
}

/**
 * Get detailed statistics for a habit
 */
export function getHabitStats(habitId: number): {
  streak: number;
  completed: number;
  total_required: number;
  completion_rate: number;
} {
  const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '{}');
  const habit = habits.find(h => h.id === habitId);
  
  if (!habit) {
    return {
      streak: 0,
      completed: 0,
      total_required: habit?.target || 1,
      completion_rate: 0
    };
  }

  const today = new Date();
  const todayKey = getTodayKey();
  
  // Check if habit is completed based on its frequency
  const isCompleted = (() => {
    switch (habit.frequency) {
      case 'daily':
        // Check if completed today
        return completions[todayKey]?.includes(habitId) || false;
        
      case 'weekly':
        // Check if completed this week
        const thisWeek = getWeekNumber(today);
        return Object.keys(completions).some(date => {
          const dateObj = new Date(date);
          return getWeekNumber(dateObj) === thisWeek && completions[date].includes(habitId);
        });
        
      case 'monthly':
        // Check if completed this month
        const thisMonth = today.getMonth();
        return Object.keys(completions).some(date => {
          const dateObj = new Date(date);
          return dateObj.getMonth() === thisMonth && completions[date].includes(habitId);
        });
        
      default:
        return false;
    }
  })();

  return {
    streak: habit.streak,
    completed: isCompleted ? 1 : 0,
    total_required: habit.target,
    completion_rate: isCompleted ? 100 : 0
  };
}

/**
 * Helper function to get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
