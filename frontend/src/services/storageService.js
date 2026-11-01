const STORAGE_KEYS = {
  TASKS: 'taskManager_tasks',
  CATEGORIES: 'taskManager_categories',
  TASKS_CORRUPT_BACKUP: 'taskManager_tasks_corrupt_backup'
};

const SAVE_DELAY = 300;
let tasksSaveTimer = null;
let pendingTasksSnapshot = null;

export const storageService = {
  // Tasks
  getTasks: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Stored tasks are not an array');
      // Drop individual records that would crash the UI
      return parsed.filter(task => task && typeof task === 'object' && typeof task.title === 'string');
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Keep the unreadable value so it can be recovered instead of silently overwritten
      try {
        localStorage.setItem(STORAGE_KEYS.TASKS_CORRUPT_BACKUP, raw);
      } catch (backupError) {
        console.error('Could not back up corrupted tasks:', backupError);
      }
      return [];
    }
  },

  saveTasks: (tasks) => {
    try {
      const serialized = JSON.stringify(tasks);
      // Skip identical writes so cross-tab sync can't ping-pong
      if (localStorage.getItem(STORAGE_KEYS.TASKS) !== serialized) {
        localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
      }
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  saveTasksDebounced: (tasks, onError) => {
    pendingTasksSnapshot = tasks;
    if (tasksSaveTimer) {
      clearTimeout(tasksSaveTimer);
    }
    tasksSaveTimer = setTimeout(() => {
      try {
        storageService.saveTasks(pendingTasksSnapshot);
      } catch (error) {
        console.error('Error saving tasks (debounced):', error);
        if (onError) {
          onError(error);
        }
      } finally {
        tasksSaveTimer = null;
        pendingTasksSnapshot = null;
      }
    }, SAVE_DELAY);
  },

  /**
   * Write any pending debounced save immediately (e.g. before the tab closes).
   */
  flushPendingTasks: () => {
    if (!tasksSaveTimer) return;
    clearTimeout(tasksSaveTimer);
    tasksSaveTimer = null;
    const snapshot = pendingTasksSnapshot;
    pendingTasksSnapshot = null;
    if (snapshot) {
      try {
        storageService.saveTasks(snapshot);
      } catch (error) {
        console.error('Error flushing tasks:', error);
      }
    }
  },

  /** Storage key holding the tasks, for cross-tab `storage` event filtering. */
  TASKS_KEY: STORAGE_KEYS.TASKS,

  // Categories
  getCategories: () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const categories = Array.isArray(parsed) ? parsed.filter(c => typeof c === 'string' && c.trim()) : [];
      // Ensure default categories exist
      if (categories.length === 0) {
        const defaults = ['Work', 'Personal', 'Shopping', 'Health'];
        storageService.saveCategories(defaults);
        return defaults;
      }
      return categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return ['Work', 'Personal', 'Shopping', 'Health'];
    }
  },

  saveCategories: (categories) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  }
};
