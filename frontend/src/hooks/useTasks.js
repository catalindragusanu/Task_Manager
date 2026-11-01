import { useState, useEffect, useRef, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';

const MAX_UNDO_HISTORY = 10;

export const useTasks = () => {
  // Lazy init: read once synchronously so the first render already has the data
  const [tasks, setTasks] = useState(() => storageService.getTasks());
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const lastIdRef = useRef(tasks.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0));
  const deletedStackRef = useRef([]);

  // Persist tasks with debounce to avoid excessive writes
  useEffect(() => {
    try {
      storageService.saveTasksDebounced(tasks, () => {
        toast.error('Unable to save tasks. Local storage may be full.');
      });
    } catch (error) {
      console.error('Error scheduling task save', error);
      toast.error('Unable to save tasks locally.');
    }
  }, [tasks]);

  // Pick up changes made in another tab instead of overwriting them on the next save
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === storageService.TASKS_KEY) {
        setTasks(storageService.getTasks());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Don't lose the last edit if the tab is closed inside the debounce window
  useEffect(() => {
    const flush = () => storageService.flushPendingTasks();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  // Date.now() alone collides when several tasks are added in the same tick
  const nextId = useCallback(() => {
    lastIdRef.current = Math.max(Date.now(), lastIdRef.current + 1);
    return lastIdRef.current;
  }, []);

  /**
   * Add a new task
   * @param {Object} task - Task object without id
   */
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: nextId(),
      createdAt: new Date().toISOString(),
      status: task.status || 'todo'
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [nextId]);

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} updates - Fields to update
   */
  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  /**
   * Delete a task. The task is kept so it can be restored with undoDelete.
   * @param {number} id - Task ID
   */
  const deleteTask = useCallback((id) => {
    const target = tasksRef.current.find(t => t.id === id);
    if (!target) return;
    deletedStackRef.current = [target, ...deletedStackRef.current].slice(0, MAX_UNDO_HISTORY);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  /**
   * Restore a deleted task
   * @param {number} [id] - Task ID to restore; defaults to the most recent deletion
   */
  const undoDelete = useCallback((id) => {
    const stack = deletedStackRef.current;
    const index = id === undefined ? 0 : stack.findIndex(t => t.id === id);
    if (index === -1 || !stack[index]) return;
    const [restored] = stack.splice(index, 1);
    setTasks(prev => (prev.some(t => t.id === restored.id) ? prev : [...prev, restored]));
  }, []);

  /**
   * Get tasks by category
   * @param {string} category - Category name
   */
  const getTasksByCategory = (category) => {
    return tasks.filter(task => task.category === category);
  };

  /**
   * Get tasks by status
   * @param {string} status - Status value
   */
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  /**
   * Get tasks by date
   * @param {string} date - Date in ISO format
   */
  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(date);
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDate
  };
};
