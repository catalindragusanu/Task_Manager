import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { getTodayISO } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';

const Brainstorming = ({ categories, onAddTask }) => {
  const [context, setContext] = useState('');
  const [taskType, setTaskType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const handleBrainstorm = async (e) => {
    e.preventDefault();
    if (!context.trim()) {
      toast.error('Please enter a context or goal');
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await apiService.brainstorm(context, taskType);
      const ideas = Array.isArray(result.suggestions) ? result.suggestions : [];
      setSuggestions(ideas);
      if (ideas.length === 0) {
        toast.error('The AI returned no usable ideas. Try rephrasing your goal.');
      } else {
        toast.success('Ideas generated');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion) => {
    const task = {
      title: suggestion.title,
      description: suggestion.description || '',
      category: categories[0] || 'Work',
      priority: suggestion.priority || 'medium',
      dueDate: getTodayISO()
    };
    onAddTask(task);
    toast.success('Task added to your list!');
  };

  return (
    <div className="brainstorming">
      <div className="brainstorm-header">
        <h2>AI Brainstorming</h2>
        <p>Get AI-powered task suggestions based on your goals</p>
      </div>

      <form className="brainstorm-form" onSubmit={handleBrainstorm}>
        <div className="form-group">
          <label htmlFor="context">What do you want to accomplish?</label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="E.g., 'I want to launch a new website for my business' or 'I need to organize a team event'"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskType">Task Type</label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            <option value="general">General</option>
            <option value="project">Project Planning</option>
            <option value="creative">Creative</option>
            <option value="research">Research</option>
            <option value="business">Business</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Brainstorming...' : '💡 Generate Ideas'}
        </button>
      </form>

      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          Thinking up suggestions...
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h3>Suggested Tasks</h3>
          <div className="suggestion-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-content">
                  <h4>{suggestion.title}</h4>
                  {suggestion.description && (
                    <p className="suggestion-description">{suggestion.description}</p>
                  )}
                  {suggestion.priority && (
                    <span className={`suggestion-priority ${suggestion.priority}`}>
                      {suggestion.priority} priority
                    </span>
                  )}
                </div>
                <button
                  className="btn-add-suggestion"
                  onClick={() => handleAddSuggestion(suggestion)}
                >
                  + Add to Tasks
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Brainstorming;
