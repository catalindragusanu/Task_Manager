import React, { useState } from 'react';
import CalendarLib from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

const Calendar = ({ tasks, onUpdateTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate && task.dueDate.startsWith(dateStr));
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const tasksOnDate = getTasksForDate(date);
      if (tasksOnDate.length > 0) {
        return (
          <div className="calendar-task-indicator">
            <span className="task-count">{tasksOnDate.length}</span>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const tasksOnDate = getTasksForDate(date);
      if (tasksOnDate.length > 0) {
        return 'has-tasks';
      }
    }
    return null;
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Calendar View</h2>
      </div>

      <div className="calendar-container">
        <div className="calendar-wrapper">
          <CalendarLib
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        <div className="calendar-tasks">
          <h3>{format(selectedDate, 'MMMM d, yyyy')}</h3>
          {selectedDateTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="task-list">
              {selectedDateTasks.map(task => (
                <div key={task.id} className={`calendar-task-item ${task.status}`}>
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'not done' : 'done'}`}
                    onChange={() =>
                      onUpdateTask(task.id, {
                        status: task.status === 'done' ? 'todo' : 'done'
                      })
                    }
                  />
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-badges">
                      {task.category && <span className="badge">{task.category}</span>}
                      <span className={`badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
