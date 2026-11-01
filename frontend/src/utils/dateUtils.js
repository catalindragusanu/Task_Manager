import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Format a date for display with relative labels
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with labels like "Today", "Tomorrow"
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Check if a task is overdue
 * @param {string} dueDate - ISO date string
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  try {
    const date = parseISO(dueDate);
    return isPast(date) && !isToday(date);
  } catch (error) {
    return false;
  }
};

/**
 * Get today's date (local timezone) as yyyy-MM-dd.
 * toISOString() would return the UTC date, which is wrong in the evening/early
 * morning for anyone not on UTC.
 * @returns {string} Date string
 */
export const getTodayISO = () => format(new Date(), 'yyyy-MM-dd');
