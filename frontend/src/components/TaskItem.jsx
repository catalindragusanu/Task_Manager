import React, { useState, memo } from 'react';
import { formatRelativeDate, isOverdue } from '../utils/dateUtils';
import { getPriorityColor, getStatusColor } from '../utils/taskUtils';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const TaskItem = memo(({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '' });

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

  // Start from the task's current values every time, so a cancelled or stale
  // edit never resurfaces and unrelated fields are never overwritten on save.
  const handleStartEdit = () => {
    setDraft({ title: task.title, description: task.description || '' });
    setIsEditing(true);
  };

  const handleSave = () => {
    const title = draft.title.trim();
    if (!title) {
      toast.error('Task title cannot be empty');
      return;
    }
    onUpdate(task.id, { title, description: draft.description.trim() });
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Escape') setIsEditing(false);
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') handleSave();
  };

  if (isEditing) {
    return (
      <div className="task-item editing" onKeyDown={handleEditKeyDown}>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="edit-input"
          aria-label="Task title"
          autoFocus
        />
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="edit-textarea"
          placeholder="Description..."
          aria-label="Task description"
        />
        <div className="edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${getStatusColor(task.status)} ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
          aria-label={task.status === 'done' ? 'Mark task as todo' : 'Mark task as done'}
        />
      </div>

      <div className="task-content">
        <h3 className={task.status === 'done' ? 'completed' : ''}>{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}

        <div className="task-meta">
          {task.category && <span className="task-category">{task.category}</span>}
          <span className={`task-priority ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="task-due-date">
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn-icon" onClick={handleStartEdit} title="Edit" aria-label="Edit task">
          <FiEdit2 aria-hidden="true" />
        </button>
        <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete" aria-label="Delete task">
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default TaskItem;
