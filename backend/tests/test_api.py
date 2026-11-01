"""API and AI-service tests. Ollama is mocked, so no model needs to be running."""
import os
import sys
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app  # noqa: E402
from app.extensions import limiter  # noqa: E402
from app.services.ai_service import AIService  # noqa: E402


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv('API_KEY', '')
    app = create_app()
    app.config.update(TESTING=True, API_KEY=None, AI_ROUTE_RATE_LIMIT='1000/hour')
    limiter.reset()
    return app.test_client()


def _ollama_reply(text):
    resp = MagicMock(status_code=200)
    resp.json.return_value = {'response': text}
    return resp


def _tags_ok():
    return MagicMock(status_code=200)


# ---- validation -----------------------------------------------------------

@pytest.mark.parametrize('payload', [
    [],
    ['context'],
    {},
    {'context': 123},
    {'context': '   '},
    {'context': 'x' * 501},
    {'context': 'ok', 'taskType': ['general']},
    {'context': 'ok', 'taskType': 'nonsense'},
])
def test_brainstorm_rejects_bad_payloads(client, payload):
    assert client.post('/api/brainstorm', json=payload).status_code == 400


@pytest.mark.parametrize('payload', [[], ['tasks'], {}, {'tasks': 'nope'}, {'tasks': [{}] * 201}])
def test_generate_plan_rejects_bad_payloads(client, payload):
    assert client.post('/api/generate-plan', json=payload).status_code == 400


# ---- happy paths and normalisation ---------------------------------------

def test_brainstorm_returns_normalised_suggestions(client):
    raw = '{"suggestions": [{"title": "Write spec", "priority": "URGENT"}, {"title": ""}, "junk"]}'
    with patch('app.services.ai_service.requests.get', return_value=_tags_ok()), \
         patch('app.services.ai_service.requests.post', return_value=_ollama_reply(raw)):
        resp = client.post('/api/brainstorm', json={'context': 'launch site'})
    assert resp.status_code == 200
    assert resp.get_json()['suggestions'] == [
        {'title': 'Write spec', 'description': '', 'priority': 'medium'}
    ]


def test_generate_plan_normalises_model_output(client):
    raw = '```json\n{"suggestion": "Go", "tasks": [{"title": "A", "startTime": "9:00", "endTime": "bad", "subtasks": ["x", ""]}]}\n```'
    with patch('app.services.ai_service.requests.get', return_value=_tags_ok()), \
         patch('app.services.ai_service.requests.post', return_value=_ollama_reply(raw)):
        resp = client.post('/api/generate-plan', json={'tasks': [{'title': 'A'}]})
    plan = resp.get_json()
    assert resp.status_code == 200
    assert plan['tasks'][0]['startTime'] == '09:00'
    assert 'endTime' not in plan['tasks'][0]
    assert plan['tasks'][0]['subtasks'] == ['x']


def test_empty_task_list_skips_ollama(client):
    with patch('app.services.ai_service.requests.post') as post:
        resp = client.post('/api/generate-plan', json={'tasks': []})
    assert resp.status_code == 200
    assert resp.get_json()['tasks'] == []
    post.assert_not_called()


# ---- failure modes --------------------------------------------------------

def test_ollama_down_returns_503(client):
    import requests
    with patch('app.services.ai_service.requests.get', side_effect=requests.exceptions.ConnectionError('refused')):
        resp = client.post('/api/brainstorm', json={'context': 'anything'})
    assert resp.status_code == 503


def test_garbage_model_output_yields_empty_result_not_crash():
    service = AIService()
    assert service._parse_suggestions('not json at all') == []
    assert service._parse_plan('not json at all')['tasks'] == []
    assert service._parse_plan('[1, 2]')['tasks'] == []


# ---- auth -----------------------------------------------------------------

def test_api_key_enforced_with_constant_time_check(client):
    client.application.config['API_KEY'] = 'secret'
    assert client.post('/api/brainstorm', json={'context': 'x'}).status_code == 401
    assert client.post('/api/brainstorm', json={'context': 'x'}, headers={'X-API-Key': 'wrong'}).status_code == 401
    # health stays open; preflight is never blocked
    assert client.get('/api/health').status_code == 200
    assert client.options('/api/brainstorm').status_code != 401
