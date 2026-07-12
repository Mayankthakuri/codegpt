# ChatGPT Clone

A ChatGPT-like interface powered by DeepSeek API.

## Features

- Chat interface with streaming responses
- Sidebar with conversation history (localStorage)
- Markdown rendering in AI responses
- Code syntax highlighting with copy button
- Dark/Light mode toggle
- Responsive design (mobile + desktop)

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **API:** DeepSeek Chat API

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your DeepSeek API key:
```
DEEPSEEK_API_KEY=your_api_key_here
```

Get your API key from: https://platform.deepseek.com/

```bash
npm install
npm run dev
```

Server runs on http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### 3. Open Browser

Go to http://localhost:3000 and start chatting!

## Project Structure

```
chatgpt-clone/
├── backend/
│   ├── server.js          # Express server with DeepSeek API proxy
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx       # Main chat interface
│   │   │   ├── Sidebar.jsx    # Conversation history
│   │   │   ├── Message.jsx    # Message with markdown
│   │   │   └── Header.jsx     # Top bar with theme toggle
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## How It Works

1. User types a message and presses Enter
2. Frontend sends message to backend `/api/chat`
3. Backend forwards to DeepSeek API with streaming
4. Response streams back via Server-Sent Events (SSE)
5. UI updates in real-time as tokens arrive
6. Conversations saved to localStorage

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key |
| `PORT` | Backend port (default: 5000) |
