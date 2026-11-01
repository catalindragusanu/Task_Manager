import React, { useEffect, useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList';
import Brainstorming from './components/Brainstorming';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { notificationService } from './utils/notificationService';
import { toast } from 'react-hot-toast';

const DailyPlanner = lazy(() => import('./components/DailyPlanner'));
const Calendar = lazy(() => import('./components/Calendar'));

function App() {
  const [currentView, setCurrentView] = useState('tasks');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('taskManager_notifications') === 'true';
  });
  const { tasks, addTask, updateTask, deleteTask, undoDelete } = useTasks();
  const { categories, addCategory } = useCategories();

  // Initialize notifications when enabled
  useEffect(() => {
    if (notificationsEnabled && tasks.length > 0) {
      notificationService.startPeriodicCheck(tasks, 15); // Check every 15 minutes
    } else {
      notificationService.stopPeriodicCheck();
    }

    return () => {
      notificationService.stopPeriodicCheck();
    };
  }, [notificationsEnabled, tasks]);

  // Handle notification toggle
  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('taskManager_notifications', 'true');
        notificationService.startPeriodicCheck(tasks, 15);
      } else {
        toast.error('Enable notifications in your browser settings to use reminders.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('taskManager_notifications', 'false');
      notificationService.stopPeriodicCheck();
    }
  };

  // Clear notification when task is marked as done
  const handleUpdateTask = (id, updates) => {
    updateTask(id, updates);
    if (updates.status === 'done') {
      notificationService.clearNotifiedTask(id);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            categories={categories}
            onAddTask={addTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={deleteTask}
            onUndoDelete={undoDelete}
            onAddCategory={addCategory}
          />
        );
      case 'planner':
        return (
          <DailyPlanner
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onAddTask={addTask}
          />
        );
      case 'brainstorm':
        return (
          <Brainstorming
            categories={categories}
            onAddTask={addTask}
          />
        );
      case 'calendar':
        return (
          <Calendar
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
      />
      <main className="container">
        <Suspense fallback={<div className="loading-state">Loading view...</div>}>
          {renderView()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
