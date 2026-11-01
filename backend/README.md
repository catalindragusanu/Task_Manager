# Task Manager Backend

Flask API server providing AI-powered brainstorming and daily planning features.

## Features

- AI-powered task brainstorming
- Daily plan generation based on task priorities
- RESTful API endpoints
- OpenAI GPT-3.5 integration

## Setup

### Prerequisites

- Python 3.8 or higher
- pip
- OpenAI API key

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

6. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

### Running the Server

```bash
python run.py
```

The server will start on `http://localhost:4001`

## API Endpoints

### Health Check

**GET** `/`
```json
{
  "status": "healthy",
  "service": "Task Manager API",
  "version": "1.0.0"
}
```

**GET** `/api/health`
```json
{
  "status": "healthy",
  "openai_configured": true
}
```

### Brainstorming

**POST** `/api/brainstorm`

Request:
```json
{
  "context": "I want to launch a new website for my business",
  "taskType": "project"
}
```

Response:
```json
{
  "suggestions": [
    {
      "title": "Define website goals and target audience",
      "description": "Identify the primary purpose and who will use the site",
      "priority": "high"
    }
  ]
}
```

Task Types: `general`, `project`, `creative`, `research`, `business`

### Daily Plan Generation

**POST** `/api/generate-plan`

Request:
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "priority": "high",
      "dueDate": "2024-12-10",
      "category": "Work"
    }
  ]
}
```

Response:
```json
{
  "suggestion": "Focus on high-priority items first, then tackle medium priority tasks",
  "tasks": [
    {
      "title": "Complete project proposal",
      "reason": "High priority and due soon",
      "timeEstimate": "2 hours"
    }
  ]
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration management
│   ├── routes/
│   │   ├── __init__.py
│   │   └── brainstorm.py    # Brainstorming endpoints
│   └── services/
│       ├── __init__.py
│       └── ai_service.py    # OpenAI integration
├── requirements.txt         # Python dependencies
├── run.py                   # Application entry point
├── .env.example             # Environment variables template
└── .gitignore              # Git ignore rules
```

## Development

### Adding New Endpoints

1. Create a new blueprint in `app/routes/`
2. Register the blueprint in `app/__init__.py`
3. Implement your route handlers

### Environment Variables

- `OLLAMA_URL` - Ollama API URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - AI model to use (default: llama3.2:latest)
- `FLASK_ENV` - `development` or `production`
- `FLASK_DEBUG` - `True` or `False`
- `PORT` - Server port (default: 4001)
- `CORS_ORIGINS` - Allowed CORS origins (default: http://localhost:4000)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing or invalid parameters)
- `500` - Server error (API key missing, OpenAI errors, etc.)
