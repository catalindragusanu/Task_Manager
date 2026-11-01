import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4001/api';
const API_KEY = process.env.REACT_APP_API_KEY;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Turn an axios error into a user-facing message that says what actually went wrong.
 */
const toUserMessage = (error, fallback) => {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ECONNABORTED') return 'The AI took too long to respond. Try again in a moment.';
  if (!error.response) return 'Cannot reach the backend. Make sure it is running on port 4001.';
  return fallback;
};

const withRetry = async (requestFn, retries = 2, baseDelay = 500) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await requestFn();
    } catch (error) {
      // Only retry when no response arrived (dropped connection). Any HTTP
      // answer (400 validation, 429 rate limit, 503 Ollama down) would just
      // fail again, and each AI call counts against the rate limit.
      const isTransient = !error.response && error.code !== 'ECONNABORTED';
      if (!isTransient || attempt >= retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
      attempt += 1;
    }
  }
};

export const apiService = {
  /**
   * Get AI-powered brainstorming suggestions
   * @param {string} context - User's context or goal
   * @param {string} taskType - Type of tasks to generate
   * @returns {Promise<Array>} Array of suggested tasks
   */
  brainstorm: async (context, taskType = 'general') => {
    const request = () => axios.post(`${API_BASE}/brainstorm`, {
      context,
      taskType
    }, {
      timeout: 120000, // 2 minutes timeout for AI processing
      headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
    });

    try {
      const response = await withRetry(request);
      return response.data;
    } catch (error) {
      console.error('Brainstorm API error:', error);
      throw new Error(toUserMessage(error, 'Failed to generate brainstorming suggestions'));
    }
  },

  /**
   * Generate an optimized daily plan from tasks
   * @param {Array} tasks - Array of task objects
   * @returns {Promise<Object>} Daily plan with prioritized tasks
   */
  generateDailyPlan: async (tasks) => {
    const request = () => axios.post(`${API_BASE}/generate-plan`, {
      tasks
    }, {
      timeout: 120000, // 2 minutes timeout for AI processing
      headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
    });

    try {
      const response = await withRetry(request);
      return response.data;
    } catch (error) {
      console.error('Daily plan API error:', error);
      throw new Error(toUserMessage(error, 'Failed to generate daily plan'));
    }
  }
};
