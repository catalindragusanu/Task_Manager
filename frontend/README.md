# Task Manager Frontend

React-based web application for managing tasks with AI-powered features.

## Features

- Create, edit, and delete tasks
- Organize tasks by categories
- Filter and search tasks
- AI-powered brainstorming for task ideas
- AI-generated daily plans
- Calendar view for task scheduling
- Priority levels (High, Medium, Low)
- Task status tracking (Todo, In Progress, Done)
- Local storage persistence

## Setup

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:4000`

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── TaskList.jsx     # Main task list view
│   │   ├── TaskItem.jsx     # Individual task component
│   │   ├── TaskForm.jsx     # Create/edit task form
│   │   ├── DailyPlanner.jsx # AI daily planning
│   │   ├── Brainstorming.jsx # AI brainstorming
│   │   ├── Calendar.jsx     # Calendar view
│   │   └── CategoryFilter.jsx # Category filtering
│   ├── services/
│   │   ├── storageService.js # LocalStorage operations
│   │   └── apiService.js    # Backend API calls
│   ├── hooks/
│   │   ├── useTasks.js      # Task management hook
│   │   └── useCategories.js # Category management hook
│   ├── utils/
│   │   ├── dateUtils.js     # Date formatting utilities
│   │   └── taskUtils.js     # Task filtering/sorting
│   ├── styles/
│   │   └── App.css          # Global styles
│   ├── App.jsx              # Main app component
│   └── index.js             # Entry point
└── package.json
```

## Features Guide

### Task Management

- **Create Task**: Click "New Task" button, fill in details, and submit
- **Edit Task**: Click the edit icon on any task
- **Delete Task**: Click the trash icon on any task
- **Complete Task**: Check the checkbox to mark as done

### Categories

- Default categories: Work, Personal, Shopping, Health
- Add new categories using the "+ Add" button in the category filter
- Filter tasks by category by clicking category chips

### Daily Planner

1. Click "Daily Planner" in the navigation
2. Click "Generate AI Plan" to create an optimized schedule
3. AI will prioritize tasks based on:
   - Due dates
   - Priority levels
   - Task complexity

### Brainstorming

1. Click "Brainstorm" in the navigation
2. Enter your goal or context
3. Select task type
4. Click "Generate Ideas"
5. Add suggested tasks directly to your task list

### Calendar View

- View tasks by date
- Click on any date to see scheduled tasks
- Check/uncheck tasks directly from the calendar

## Data Storage

All tasks and categories are stored in browser's `localStorage`:
- `taskManager_tasks` - Task data
- `taskManager_categories` - Category list

**Note**: Data is stored locally in your browser. Clearing browser data will delete all tasks.

## Configuration

### Backend API URL

By default, the app connects to `http://localhost:4001`. To change this:

1. Create a `.env` file in the frontend directory
2. Add: `REACT_APP_API_URL=your_backend_url`

## Dependencies

- `react` - UI framework
- `react-dom` - React DOM rendering
- `axios` - HTTP client for API calls
- `date-fns` - Date formatting and manipulation
- `react-calendar` - Calendar component

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### AI Features Not Working

1. Ensure backend is running on port 4001
2. Check that Ollama is running: `ollama serve`
3. Verify Ollama model is installed: `ollama list`
4. Check browser console for error messages

### Tasks Not Persisting

1. Ensure browser allows localStorage
2. Check if localStorage is full (5-10MB limit)
3. Clear browser cache if issues persist
