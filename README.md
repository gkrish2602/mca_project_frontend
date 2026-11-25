# Meetwise frontend

React workspace for the Real-Time AI Meeting Summarizer. It connects to the Django REST API to capture meetings, follow processing progress, review AI-generated notes, and manage action items.

## Stack

- React 19 and Vite 6
- Redux Toolkit and RTK Query
- React Router
- Bootstrap 5 and Bootstrap Icons
- JWT access/refresh handling with credentials stored in `sessionStorage`

## Run locally

Requirements: Node.js/npm, the backend API, Redis, and a Celery worker. For audio transcription or AI summaries, configure `OPENAI_API_KEY` in the backend. See the [backend README](../MeetingSummarizer/python_meeting_summarizer_venv/backend/README.md).

From this directory:

```powershell
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. By default, API requests use the same-origin `/api/` path and Vite proxies `/api` and `/media` to Django at `http://127.0.0.1:8000`.

To use the default proxy explicitly, create `.env` from the example:

```powershell
Copy-Item .env.example .env
```

```env
VITE_API_BASE_URL=/api/
```

Restart Vite after changing environment variables. For a direct API connection, use an absolute URL such as `http://127.0.0.1:8000/api/` and add the browser's frontend origin to backend `CORS_ALLOWED_ORIGINS`.

## Features

- Register and sign in with JWT authentication.
- View organization-scoped meeting and action-item analytics.
- Create meetings from MP3/MP4/MPEG/MPGA/M4A/WAV/WebM recordings (25 MB maximum) or pasted transcripts and rough notes.
- Follow queued, processing, completed, and failed meeting states; processing state refreshes automatically and failed meetings can be retried.
- Review meeting summaries, decisions, transcripts, unresolved questions, action owners, and deadlines.
- Filter tasks and mark action items complete.
- Prepare an editable follow-up email and send it with one click.
- Receive clear error and success feedback through toast notifications.

Audio analysis and reminders run asynchronously in the backend. Celery, Redis, and configured provider credentials are required for those workflows.

## Routes

| Route | Description |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create a member account |
| `/` | Workspace dashboard |
| `/meetings` | Meeting list and meeting input |
| `/meetings/:id` | Meeting notes and processing state |
| `/tasks` | Action-item list and status management |

Workspace routes require an active session.

## Structure

```text
src/
  app/                  Redux store and shared hooks
  components/
    actions/            Action-item rows and follow-up editor
    common/             Feedback, loading, and status components
    layout/             Workspace navigation and profile menu
    meetings/           Meeting cards and input form
  features/
    auth/               Login, registration, session, and route protection
    notifications/      Toast notification state
  pages/                Dashboard, meetings, meeting details, and tasks
  services/api.js        RTK Query endpoints and token refresh
```

## Development and production build

```powershell
npm run dev
npm run build
npm run preview
```

The production bundle is written to `dist/`. Deploy it behind a web server that routes `/api` and `/media` to the backend, or set `VITE_API_BASE_URL` to the deployed API origin during the build.

## Authentication

The frontend stores access and refresh tokens in the current tab's `sessionStorage`, attaches the access token to API requests, and refreshes expired access tokens. Public registration creates member accounts; privileged roles are managed by an administrator in Django admin.
