import { sortByPriority, sortByDueDate, filterTasksBySearch } from './taskUtils';
import { getTodayISO } from './dateUtils';
import { storageService } from '../services/storageService';

describe('taskUtils', () => {
  test('sortByPriority tolerates unknown priorities', () => {
    const sorted = sortByPriority([
      { id: 1, priority: 'low' },
      { id: 2, priority: 'bogus' },
      { id: 3, priority: 'high' }
    ]);
    expect(sorted.map(t => t.id)).toEqual([3, 2, 1]);
  });

  test('sortByDueDate puts undated tasks last', () => {
    const sorted = sortByDueDate([
      { id: 1 },
      { id: 2, dueDate: '2030-02-01' },
      { id: 3, dueDate: '2030-01-01' }
    ]);
    expect(sorted.map(t => t.id)).toEqual([3, 2, 1]);
  });

  test('filterTasksBySearch does not crash on a missing title', () => {
    expect(filterTasksBySearch([{ id: 1 }, { id: 2, title: 'Buy milk' }], 'milk')).toHaveLength(1);
  });
});

describe('getTodayISO', () => {
  test('uses the local calendar date, not UTC', () => {
    jest.useFakeTimers().setSystemTime(new Date(2030, 0, 15, 23, 30)); // local 23:30
    expect(getTodayISO()).toBe('2030-01-15');
    jest.useRealTimers();
  });
});

describe('storageService', () => {
  beforeEach(() => localStorage.clear());

  test('backs up unreadable task data instead of discarding it', () => {
    localStorage.setItem('taskManager_tasks', '{not json');
    expect(storageService.getTasks()).toEqual([]);
    expect(localStorage.getItem('taskManager_tasks_corrupt_backup')).toBe('{not json');
  });

  test('drops malformed records but keeps valid ones', () => {
    localStorage.setItem('taskManager_tasks', JSON.stringify([null, { id: 1 }, { id: 2, title: 'ok' }]));
    expect(storageService.getTasks()).toEqual([{ id: 2, title: 'ok' }]);
  });

  test('flushPendingTasks writes a debounced save immediately', () => {
    storageService.saveTasksDebounced([{ id: 1, title: 'a' }]);
    expect(localStorage.getItem('taskManager_tasks')).toBeNull();
    storageService.flushPendingTasks();
    expect(JSON.parse(localStorage.getItem('taskManager_tasks'))).toHaveLength(1);
  });
});
