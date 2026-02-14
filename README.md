# ATS Resume Builder Ecosystem

A complete ATS (Applicant Tracking System) friendly resume builder with web app, desktop app, Chrome extension, and AI-powered optimization.

## 🏗️ Architecture Overview

```
ats-resume-builder/
├── web/                    # React + TypeScript Web Application
├── server/                 # Node.js + Express Backend API
├── desktop/                # Electron Desktop Application
├── extension/              # Chrome Extension (Manifest v3)
├── shared/                 # Shared types, utilities, constants
└── docs/                   # Documentation
```

## 🚀 Features

- **Resume Builder**: Drag-and-drop sections, live preview
- **ATS Analyzer**: Score your resume against job descriptions
- **AI Optimizer**: OpenAI/Claude powered suggestions
- **Multi-format Export**: PDF, DOCX, TXT
- **Chrome Extension**: Extract JD from LinkedIn/Naukri
- **Desktop App**: Offline mode with local storage
- **Dark/Light Mode**: Modern, clean UI

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript |
| Desktop | Electron |
| Extension | Chrome Manifest v3 |
| Database | SQLite (local), MongoDB (cloud) |
| AI | OpenAI GPT-4 / Claude API |
| Testing | Jest, Playwright |

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (for AI features)

### Installation

```bash
# Clone and install all dependencies
npm run install:all

# Start development (web + server)
npm run dev

# Start desktop app
npm run desktop

# Build Chrome extension
npm run build:extension
```

## 🔑 Environment Variables

Create `.env` files in respective directories:

### Server (.env)
```
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
MONGODB_URI=mongodb://localhost:27017/ats-resume
JWT_SECRET=your_jwt_secret
```

### Web (.env)
```
VITE_API_URL=http://localhost:3001
```

## 📄 License

MIT License
