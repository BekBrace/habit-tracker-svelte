<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { 
    initializeDatabase, 
    getAllHabits, 
    addHabit as dbAddHabit, 
    deleteHabit as dbDeleteHabit, 
    toggleHabitCompletion,
    updateHabit,
    getHabitStats 
  } from '$lib/db';

  let habits = [];
  let selectedIndex = 0;
  let isAddingHabit = false;
  let isEditingHabit = false;
  let showingDetails = false;
  let newHabitName = '';
  let newHabitFrequency = 'daily';
  let newHabitTarget = 1;
  let newHabitCategory = '';
  let newHabitNotes = '';

  // For editing existing habit
  let editingHabit = null;

  function loadHabits() {
    habits = getAllHabits();
  }

  function handleKeydown(e) {
    if (isAddingHabit || isEditingHabit) {
      if (e.key === 'Enter') {
        if (isAddingHabit) {
          addHabit();
        } else {
          saveHabitEdit();
        }
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
      return;
    }

    if (showingDetails && e.key === 'Escape') {
      showingDetails = false;
      return;
    }

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        selectedIndex = Math.min(selectedIndex + 1, habits.length - 1);
        break;
      case 'k':
      case 'ArrowUp':
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case ' ':
        toggleHabit(selectedIndex);
        break;
      case 'n':
        isAddingHabit = true;
        break;
      case 'd':
        deleteHabit(selectedIndex);
        break;
      case 'e':
        startEditing(habits[selectedIndex]);
        break;
      case 'Enter':
        showHabitDetails(habits[selectedIndex]);
        break;
    }
  }

  function toggleHabit(index) {
    const habit = habits[index];
    toggleHabitCompletion(habit.id, !habit.completed);
    loadHabits();
  }

  function addHabit() {
    if (newHabitName.trim()) {
      dbAddHabit(
        newHabitName.trim(), 
        newHabitFrequency, 
        newHabitTarget, 
        newHabitCategory, 
        undefined, 
        newHabitNotes
      );
      cancelEdit();
      loadHabits();
    }
  }

  function startEditing(habit) {
    editingHabit = habit;
    newHabitName = habit.name;
    newHabitFrequency = habit.frequency;
    newHabitTarget = habit.target;
    newHabitCategory = habit.category;
    newHabitNotes = habit.notes || '';
    isEditingHabit = true;
  }

  function saveHabitEdit() {
    if (editingHabit && newHabitName.trim()) {
      updateHabit(editingHabit.id, {
        name: newHabitName.trim(),
        frequency: newHabitFrequency,
        target: newHabitTarget,
        category: newHabitCategory,
        notes: newHabitNotes
      });
      cancelEdit();
      loadHabits();
    }
  }

  function cancelEdit() {
    isAddingHabit = false;
    isEditingHabit = false;
    editingHabit = null;
    newHabitName = '';
    newHabitFrequency = 'daily';
    newHabitTarget = 1;
    newHabitCategory = '';
    newHabitNotes = '';
  }

  function deleteHabit(index) {
    const habit = habits[index];
    dbDeleteHabit(habit.id);
    loadHabits();
    if (selectedIndex >= habits.length) {
      selectedIndex = Math.max(0, habits.length - 1);
    }
  }

  function showHabitDetails(habit) {
    editingHabit = habit;
    showingDetails = true;
  }

  onMount(() => {
    initializeDatabase();
    loadHabits();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <header class="mb-8">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">HabitFlow</h1>
    <p class="text-gray-600 dark:text-gray-400">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
  </header>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    {#if isAddingHabit || isEditingHabit}
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">
          {isEditingHabit ? 'Edit Habit' : 'New Habit'}
        </h2>
        <input
          bind:value={newHabitName}
          placeholder="Habit name..."
          class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-3"
        />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              bind:value={newHabitFrequency}
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target
            </label>
            <input
              type="number"
              bind:value={newHabitTarget}
              min="1"
              class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <input
            bind:value={newHabitCategory}
            placeholder="e.g., Health, Learning..."
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            bind:value={newHabitNotes}
            placeholder="Add any notes or description..."
            class="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="2"
          ></textarea>
        </div>
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Press Enter to save, Escape to cancel</p>
        </div>
      </div>
    {:else if showingDetails && editingHabit}
      {@const stats = getHabitStats(editingHabit.id)}
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{editingHabit.name}</h2>
          <button
            on:click={() => startEditing(editingHabit)}
            class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Progress</h3>
            <div class="mt-2">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                <div
                  class="bg-blue-600 h-2.5 rounded-full transition-all"
                  style="width: {stats.completion_rate}%"
                ></div>
              </div>
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Completed: {stats.completed}</span>
                <span>Required: {stats.total_required}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Frequency</h3>
            <p class="text-gray-600 dark:text-gray-400">
              {editingHabit.frequency.charAt(0).toUpperCase() + editingHabit.frequency.slice(1)}
            </p>
          </div>
          <div>
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Category</h3>
            <p class="text-gray-600 dark:text-gray-400">{editingHabit.category}</p>
          </div>

          <div>
            <h3 class="font-medium text-gray-700 dark:text-gray-300">Statistics</h3>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                <p class="text-lg font-semibold">
                  🔥 {stats.streak} {editingHabit.frequency}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                <p class="text-lg font-semibold">{stats.completion_rate}%</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                <p class="text-lg font-semibold">{stats.week_completions}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                <p class="text-lg font-semibold">{stats.month_completions}</p>
              </div>
            </div>
          </div>

          {#if editingHabit.notes}
            <div>
              <h3 class="font-medium text-gray-700 dark:text-gray-300">Notes</h3>
              <p class="text-gray-600 dark:text-gray-400 mt-1">{editingHabit.notes}</p>
            </div>
          {/if}
        </div>

        <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Press Escape to close, 'e' to edit
        </p>
      </div>
    {/if}

    <div class="space-y-4">
      {#each habits as habit, index}
        {@const stats = getHabitStats(habit.id)}
        <div
          class="p-4 rounded-lg transition-colors duration-150 {
            index === selectedIndex
              ? 'bg-blue-50 dark:bg-blue-900/30'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }"
        >
          <div class="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={habit.completed}
              class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              on:change={() => toggleHabit(index)}
            />
            <span class="flex-1 text-gray-700 dark:text-gray-200 font-medium {
              habit.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
            }">
              {habit.name}
            </span>
            {#if habit.streak > 0}
              <span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full">
                🔥 {habit.streak}
              </span>
            {/if}
          </div>
          
          <div class="ml-8 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center space-x-4">
              <span>
                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
              </span>
              <span>•</span>
              <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {habit.category}
              </span>
            </div>
            
            <div class="mt-2">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                <div
                  class="bg-blue-600 h-2.5 rounded-full transition-all"
                  style="width: {stats.completion_rate}%"
                ></div>
              </div>
              <div class="flex justify-between text-xs">
                <span>Progress: {stats.completed}/{stats.total_required} ({stats.completion_rate}%)</span>
                <span>Target: {habit.target} per {habit.frequency}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <footer class="mt-8 text-sm text-gray-500 dark:text-gray-400">
    <p class="mb-1">Keyboard shortcuts:</p>
    <ul class="grid grid-cols-2 gap-2">
      <li>↑/k: Move up</li>
      <li>↓/j: Move down</li>
      <li>Space: Toggle habit</li>
      <li>n: New habit</li>
      <li>d: Delete habit</li>
      <li>e: Edit habit</li>
      <li>Enter: View details</li>
      <li>Escape: Close/Cancel</li>
    </ul>
  </footer>
</div>
