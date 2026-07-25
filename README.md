# 🧠 DebugMind AI

> **An AI-powered debugging assistant that helps developers identify bugs, understand root causes, and generate intelligent code fixes in seconds.**

<p align="center">

**🌐 Live Demo**  
https://debugmind-ai-zeta.vercel.app/

**📁 GitHub Repository**  
https://github.com/Aayushi017005/debugmind-ai

</p>

---

# Overview

DebugMind AI is an intelligent debugging platform designed to simplify software debugging by combining modern web technologies with Large Language Models.

Instead of only displaying errors, the application explains **why the issue occurred**, suggests **production-ready fixes**, and provides **best-practice recommendations** to help developers write better code.

### What DebugMind AI provides

- 🔍 Detects bugs and programming errors from source code.
- 🧠 Identifies the root cause of the issue.
- 📖 Generates clear, beginner-friendly explanations.
- ⚡ Produces optimized and corrected code.
- 💡 Suggests alternative implementation approaches.
- 📊 Returns a confidence score for every AI analysis.
- ✅ Recommends coding best practices for cleaner and safer code.
- 🌐 Supports multiple programming languages through AI-powered analysis.

---

# Features

- AI-powered code debugging
- Root cause analysis
- Intelligent code correction
- Step-by-step bug explanation
- Alternative solution generation
- Confidence-based AI responses
- Best-practice recommendations
- Clean and responsive user interface
- Fast REST API architecture
- Cloud deployment using Vercel and Render

---

# Technology Stack

## Frontend
- HTML
- React.js
- Vite
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide React

## Backend

- Node.js
- Express.js
- REST APIs
- Groq API (Llama 3.3 70B)
- postman
  
## Deployment

- Vercel
- Render

# Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- C


# System Architecture

```
              User
                │
                ▼
      React.js Frontend (Vercel)
                │
                ▼
      Express.js REST API (Render)
                │
                ▼
         Prompt Engineering Layer
                │
                ▼
      Groq LLM (Llama 3.3 70B)
                │
                ▼
      Structured AI JSON Response
                │
                ▼
     Intelligent Debugging Report
```

---

# Installation

### Clone the repository

```bash
git clone https://github.com/Aayushi017005/debugmind-ai.git
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

---

# Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

# Project Structure

```
debugmind-ai
│
├── Frontend
│   ├── components
│   ├── services
│   ├── assets
│   └── App.jsx
│
├── backend
│   ├── config
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── utils
│   └── server.js
│
└── README.md
```

---

# Future Enhancements

- MongoDB integration for analysis history
- Export analysis as PDF
- Team collaboration support

---

# Developer

**Aayushi Mishra**

GitHub  
https://github.com/Aayushi017005

---

# License

This project is developed for educational, portfolio, and demonstration purposes.
