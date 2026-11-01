/**
 * Sort tasks by priority (high > medium > low)
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Sorted tasks
 */
export const sortByPriority = (tasks) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const rank = (task) => priorityOrder[task.priority] ?? priorityOrder.medium;
  return [...tasks].sort((a, b) => rank(a) - rank(b));
};

/**
 * Sort tasks by due date
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Sorted tasks
 */
export const sortByDueDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    // yyyy-MM-dd strings sort correctly as text and avoid timezone parsing
    return a.dueDate.localeCompare(b.dueDate);
  });
};

/**
 * Filter tasks by search query
 * @param {Array} tasks - Array of tasks
 * @param {string} query - Search query
 * @returns {Array} Filtered tasks
 */
export const filterTasksBySearch = (tasks, query) => {
  if (!query) return tasks;
  const lowerQuery = query.toLowerCase();
  return tasks.filter(task =>
    (task.title || '').toLowerCase().includes(lowerQuery) ||
    (task.description && task.description.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Group tasks by category
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Tasks grouped by category
 */
export const groupByCategory = (tasks) => {
  return tasks.reduce((groups, task) => {
    const category = task.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {});
};

/**
 * Get priority color class
 * @param {string} priority - Priority level
 * @returns {string} CSS class name
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  };
  return colors[priority] || 'priority-medium';
};

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
  const colors = {
    todo: 'status-todo',
    'in-progress': 'status-in-progress',
    done: 'status-done'
  };
  return colors[status] || 'status-todo';
};
