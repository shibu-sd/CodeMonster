# CodeMonster

> A modern problem solving platform with real-time 1v1 coding battles, algorithmic challenges, and comprehensive DSA learning system.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)

## 🚀 Features

### 🎯 Core Platform

- **Algorithmic Problems**: Curated collection of DSA problems with varying difficulty levels (Easy, Medium, Hard)
- **Multi-language Support**: Write solutions in Python, Java, and C++
- **Real-time Code Execution**: Isolated, secure code execution using Docker containers
- **Interactive Code Editor**: Monaco Editor with syntax highlighting, IntelliSense, and theme support
- **Submission History**: Track all your submissions with detailed execution results and statistics

### ⚔️ Real-time 1v1 Battles

- **Live Coding Duels**: Compete head-to-head with other programmers in real-time
- **WebSocket Integration**: Instant updates on opponent progress and submissions
- **Battle Analytics**: Track wins, losses, and performance metrics

### 📊 User Experience

- **Personalized Dashboard**: Track progress, streaks, and problem-solving statistics
- **Leaderboard**: Global rankings based on problems solved and battle performance
- **Problem Tags & Filters**: Find problems by topic, difficulty, and acceptance rate
- **Test Case Validation**: Comprehensive test cases with instant feedback
- **Acceptance Rates**: See how others performed on each problem

### 🔐 Authentication & Security

- **Clerk Integration**: Secure authentication with social login support
- **Isolated Execution**: Docker containers for secure code execution

## 🏗️ Architecture

CodeMonster is built with a modern microservices architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js 15)                 │
│          React 19 | TypeScript | Tailwind CSS v4            │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
┌────────▼────────┐       ┌───────▼────────┐
│  Backend Server │       │  Judge Service │
│   (Express.js)  │◄─────►│   (Isolated)   │
│   + PostgreSQL  │       │   + Docker     │
└────────┬────────┘       └───────┬────────┘
         │                        │
         └────────┬───────────────┘
                  │
         ┌────────▼────────┐
         │  Redis + BullMQ │
         │  (Queue/Cache)  │
         └─────────────────┘
```

### Tech Stack

**Frontend:**

- Next.js 15 with App Router and Turbopack
- TypeScript for type safety
- Tailwind CSS v4 for styling
- shadcn/ui component library
- Monaco Editor for code editing
- Socket.IO client for real-time features

**Backend:**

- Node.js with Express.js
- TypeScript throughout
- Prisma ORM with PostgreSQL
- Redis for caching and job queues
- BullMQ for async task processing
- Socket.IO for WebSocket connections
- Clerk for authentication

**Judge Service:**

- Isolated microservice for code execution
- Docker containers for each supported language
- BullMQ worker for job processing
- Language-specific execution environments
- Resource limits and timeout controls

**Infrastructure:**

- Docker for containerization
- Redis for message broker and caching
- PostgreSQL as Database
- AWS EC2 for deployment

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shibu-sd/CodeMonster.git
cd CodeMonster
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Server
cd ../server
npm install

# Judge Service
cd ../judge
npm install
```

### 3. Environment Setup

Copy the `.env.example` files to `.env` in each service directory and configure them:

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Server
cp server/.env.example server/.env

# Judge Service
cp judge/.env.example judge/.env
```

Then update the `.env` files with your configuration values (database credentials, API keys, etc.).

### 4. Database Setup

```bash
cd server
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed with sample problems
```

### 5. Build Docker Images for Judge

```bash
cd judge
npm run docker:build     # Build all language images
```

### 6. Start Services

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Server
cd server
npm run dev

# Terminal 3: Judge
cd judge
npm run dev

# Terminal 4: Redis (if not running)
redis-server
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Judge Service**: http://localhost:4000

## 📚 Project Structure

```
CodeMonster/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App Router pages and layouts
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities and configurations
├── server/                   # Express.js backend server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── repositories/     # Data access layer
│   │   ├── services/         # Business logic
│   │   ├── queues/           # BullMQ job queues
│   │   ├── websocket/        # Socket.IO handlers
│   │   └── routes/           # API routes
│   └── prisma/               # Database schema and migrations
└── judge/                    # Judge microservice
    ├── src/
    │   ├── core/             # Code execution logic
    │   ├── config/           # Language configurations
    │   └── queue/            # BullMQ workers
    └── docker/               # Docker images per language
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with 🧡 for problem solvers, by problem solvers.**
