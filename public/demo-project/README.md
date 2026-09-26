# A simple task processor API

Simple REST API for processing tasks. Built with Node.js and Express.

## Getting started

```bash
npm install
npm start
```

The server starts on `http://localhost:3000`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /api/process | Process a task |
| GET | /api/tasks | List all tasks |

### POST /api/process

Request body:

```json
{
  "userId": 1,
  "task": "some task description"
}
```

## Configuration

Copy `.env.example` to `.env` and fill in your values.
