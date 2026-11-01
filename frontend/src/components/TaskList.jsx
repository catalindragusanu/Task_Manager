import React, { useMemo, useState } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import CategoryFilter from './CategoryFilter';
import { filterTasksBySearch, sortByDueDate } from '../utils/taskUtils';
import { toast } from 'react-hot-toast';

const TaskList = ({ tasks, categories, onAddTask, onUpdateTask, onDeleteTask, onUndoDelete, onAddCategory }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDate, setNewDate] = useState('');

  const filteredTasks = useMemo(() => filterTasksBySearch(
    selectedCategory === 'all'
      ? tasks
      : tasks.filter(t => t.category === selectedCategory),
    searchQuery
  ), [selectedCategory, tasks, searchQuery]);

  const sortedTasks = useMemo(() => sortByDueDate(filteredTasks), [filteredTasks]);

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedTasks(new Set());
    setShowDatePicker(false);
  };

  const handleToggleTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleReschedule = () => {
    if (selectedTasks.size === 0) {
      toast.error('Select at least one task to reschedule.');
      return;
    }
    setShowDatePicker(true);
  };

  const handleConfirmReschedule = () => {
    if (!newDate) {
      toast.error('Please select a date.');
      return;
    }

    selectedTasks.forEach(taskId => {
      onUpdateTask(taskId, { dueDate: newDate });
    });

    toast.success(`${selectedTasks.size} task(s) rescheduled to ${newDate}`);
    setSelectedTasks(new Set());
    setShowDatePicker(false);
    setNewDate('');
    setSelectionMode(false);
  };

  const handleDelete = (taskId) => {
    onDeleteTask(taskId);
    if (!onUndoDelete) {
      toast.success('Task deleted');
      return;
    }
    toast.custom((t) => (
      <div className="undo-toast" role="status">
        <span>Task deleted</span>
        <button
          className="undo-toast-action"
          onClick={() => {
            // Bound to this specific task, so older toasts can't restore a newer deletion
            onUndoDelete(taskId);
            toast.dismiss(t.id);
            toast.success('Task restored');
          }}
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <div className="header-actions">
          {!selectionMode && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} aria-label="Create a new task">
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
          <button
            className={`btn-selection ${selectionMode ? 'active' : ''}`}
            onClick={handleToggleSelectionMode}
            aria-pressed={selectionMode}
            aria-label="Toggle task selection mode"
          >
            {selectionMode ? 'Cancel Selection' : '📅 Reschedule Tasks'}
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          categories={categories}
          onSubmit={(task) => {
            onAddTask(task);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectionMode && (
        <div className="reschedule-controls">
          <div className="reschedule-info">
            <span className="selected-count">{selectedTasks.size} task(s) selected</span>
            <button
              className="btn-reschedule"
              onClick={handleReschedule}
              disabled={selectedTasks.size === 0}
            >
              Choose New Date
            </button>
          </div>
          {showDatePicker && (
            <div className="date-picker-modal">
              <label htmlFor="newDate">Select new due date:</label>
              <input
                type="date"
                id="newDate"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="date-input"
              />
              <div className="modal-actions">
                <button className="btn-confirm" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </button>
                <button className="btn-cancel-modal" onClick={() => setShowDatePicker(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="task-controls">
        <input
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search tasks"
        />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={onAddCategory}
        />
      </div>

      <div className="task-list">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 ? (
              <p>No tasks yet. Create your first task to get started!</p>
            ) : (
              <>
                <p>No tasks match your current filters.</p>
                {hasActiveFilters && (
                  <button className="btn-secondary" onClick={handleResetFilters}>
                    Reset filters
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className={`task-list-item-wrapper ${selectionMode ? 'selection-mode' : ''}`}>
              {selectionMode && (
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => handleToggleTask(task.id)}
                    id={`select-${task.id}`}
                    aria-label={`Select task ${task.title}`}
                  />
                </div>
              )}
              <TaskItem
                task={task}
                onUpdate={onUpdateTask}
                onDelete={handleDelete}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
