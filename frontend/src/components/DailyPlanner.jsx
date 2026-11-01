import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { formatRelativeDate, getTodayISO } from '../utils/dateUtils';
import { sortByPriority } from '../utils/taskUtils';
import { toast } from 'react-hot-toast';

const DailyPlanner = ({ tasks, onUpdateTask, onAddTask }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const incompleteTasks = tasks.filter(t => t.status !== 'done');

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    setSelectedTasks(new Set()); // Reset selections
    setPlan(null); // Don't leave the old plan interactive while a new one is generated
    try {
      const result = await apiService.generateDailyPlan(incompleteTasks);
      setPlan({
        suggestion: result?.suggestion || '',
        tasks: Array.isArray(result?.tasks) ? result.tasks : []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (index) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleAddToCalendar = () => {
    if (selectedTasks.size === 0) {
      toast.error('Select at least one task to add to calendar.');
      return;
    }

    const today = getTodayISO();

    selectedTasks.forEach(index => {
      const taskItem = plan.tasks[index];
      if (!taskItem) return;

      // Build description with subtasks
      const schedule = taskItem.startTime && taskItem.endTime
        ? `Scheduled: ${taskItem.startTime} - ${taskItem.endTime}\n\n`
        : '';
      let description = `${schedule}${taskItem.reason || ''}`;

      if (taskItem.subtasks && taskItem.subtasks.length > 0) {
        description += '\n\nSteps to complete:\n';
        taskItem.subtasks.forEach((subtask, i) => {
          description += `${i + 1}. ${subtask}\n`;
        });
      }

      const newTask = {
        title: taskItem.title,
        description: description.trim(),
        priority: 'medium',
        category: 'Planner',
        dueDate: today,
        status: 'todo'
      };
      onAddTask(newTask);
    });

    toast.success(`${selectedTasks.size} task(s) added to calendar!`);
    setSelectedTasks(new Set()); // Clear selections
  };

  return (
    <div className="daily-planner">
      <div className="planner-header">
        <h2>Daily Planner</h2>
        <button
          className="btn-primary"
          onClick={handleGeneratePlan}
          disabled={loading || incompleteTasks.length === 0}
          aria-busy={loading}
        >
          {loading ? 'Generating...' : '🤖 Generate AI Plan'}
        </button>
      </div>
      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          Generating your plan...
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
        </div>
      )}

      {incompleteTasks.length === 0 && (
        <div className="empty-state">
          <p>All tasks completed! Great job! 🎉</p>
        </div>
      )}

      {!plan && incompleteTasks.length > 0 && (
        <div className="planner-empty">
          <p>Click "Generate AI Plan" to get an optimized daily schedule based on your tasks.</p>
          <div className="task-summary">
            <h3>Your Tasks ({incompleteTasks.length})</h3>
            <div className="task-list-simple">
              {sortByPriority(incompleteTasks).map(task => (
                <div key={task.id} className="task-preview">
                  <span className="task-title">{task.title}</span>
                  <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                  {task.dueDate && (
                    <span className="task-due">{formatRelativeDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {plan && (
        <div className="generated-plan">
          <div className="plan-header">
            <h3>Today's Recommended Plan</h3>
            <button
              className="btn-add-to-calendar"
              onClick={handleAddToCalendar}
              disabled={selectedTasks.size === 0}
            >
              📅 Add Selected to Calendar ({selectedTasks.size})
            </button>
          </div>
          {plan.suggestion && <p className="plan-suggestion">{plan.suggestion}</p>}

          {plan.tasks.length === 0 && (
            <div className="empty-state">
              <p>The AI didn't return a usable schedule. Try generating the plan again.</p>
            </div>
          )}

          <div className="hourly-schedule">
            {plan.tasks.map((taskItem, index) => {
              const startTime = taskItem.startTime || `${String(8 + index).padStart(2, '0')}:00`;
              const endTime = taskItem.endTime || `${String(9 + index).padStart(2, '0')}:00`;
              const isSelected = selectedTasks.has(index);

              return (
                <div key={index} className={`schedule-item ${isSelected ? 'selected' : ''}`}>
                  <div className="schedule-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTask(index)}
                      id={`task-${index}`}
                      aria-label={`Select ${taskItem.title} to add to calendar`}
                    />
                  </div>
                  <div className="schedule-time">
                    <div className="time-range">
                      <span className="start-time">{startTime}</span>
                      <span className="time-separator">-</span>
                      <span className="end-time">{endTime}</span>
                    </div>
                    {taskItem.timeEstimate && (
                      <span className="duration">{taskItem.timeEstimate}</span>
                    )}
                  </div>
                  <div className="schedule-task">
                    <div className="task-header">
                      <h4>{taskItem.title}</h4>
                      <span className="task-order">#{index + 1}</span>
                    </div>
                    {taskItem.reason && (
                      <p className="task-reason">{taskItem.reason}</p>
                    )}
                    {taskItem.subtasks && taskItem.subtasks.length > 0 && (
                      <div className="task-subtasks">
                        <h5>Steps to complete:</h5>
                        <ul>
                          {taskItem.subtasks.map((subtask, subIndex) => (
                            <li key={subIndex}>{subtask}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
