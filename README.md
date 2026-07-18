# FinRelief AI - AI Powered Debt Relief & Financial Recovery Platform

🌐 Live Demo: https://ai-powered-debt-relief.vercel.app

💻 GitHub Repository: https://github.com/Priya09023/AI-Powered-Debt-Relief

A full-stack fintech application that helps borrowers negotiate loan settlements, predict optimal settlement amounts, and generate professional negotiation letters using AI.

## Features

- **AI Settlement Prediction** — Rule-based engine that analyzes loans, income, expenses, and risk to predict optimal settlement percentages
- **AI Negotiation Letters** — Generate professional settlement request letters powered by Google Gemini AI with tone customization (polite, firm, formal, concise)
- **Loan Management** — Full CRUD for tracking multiple loans with filters, sorting, and pagination
- **Financial Profile** — Track income, expenses, savings, assets, and debts with a financial health score
- **Interactive Dashboard** — Charts for loan distribution, debt stress, EMI ratio, surplus trends, and settlement summaries
- **AI History** — Searchable, filterable history of all AI-generated letters, predictions, and recommendations
- **Know Your Rights** — Educational resources on borrower rights, debt management, government guidelines, and FAQs
- **Dark/Light Mode** — Full theme support with smooth transitions
- **Responsive Design** — Mobile-first, works across all viewport sizes
- **Export Reports** — Download branded PDF reports for loans, AI history, and full financial profiles
- **Notifications** — In-app notification center with unread badges and history

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS (custom design system)
- Framer Motion (animations)
- React Router v7
- Recharts (data visualization)
- Axios (API client)
- Lucide React (icons)
- jsPDF (PDF export)

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite (development) / PostgreSQL (production-ready)
- Pydantic v2 (validation)
- python-jose (JWT auth)
- passlib + bcrypt (password hashing)
- httpx (async HTTP client for Gemini API)
- google-generativeai (Gemini SDK)

### Database & Auth
- Supabase (PostgreSQL, Auth, Row Level Security)
- Google Gemini AI (letter generation)

## Project Structure

```
finrelief-ai/
├── src/                        # Frontend (React + Vite)
│   ├── components/
│   │   ├── auth/               # Auth layout, protected route
│   │   ├── dashboard/          # Sidebar, topbar, layout
│   │   ├── landing/            # Hero, features, workflow, FAQ, footer
│   │   ├── loans/              # Loan details modal
│   │   ├── prediction/         # Financial analysis report
│   │   ├── profile/            # Recommendations panel
│   │   └── ui/                 # Badge, Modal, Skeleton, ProgressBar, etc.
│   ├── context/                # Auth, Theme, Toast, Notification contexts
│   ├── hooks/                  # useUserData, useFinancialMetrics
│   ├── lib/                    # Supabase, API client, types, AI, Gemini, export
│   ├── pages/                  # All page components
│   ├── App.tsx                 # Router + providers
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + Tailwind
├── backend/                    # Backend (FastAPI)
│   ├── app/
│   │   ├── auth/               # JWT handler
│   │   ├── models/             # SQLAlchemy models
│   │   ├── routers/            # API routes (auth, loans, profile, etc.)
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Settlement engine, Gemini service
│   │   ├── utils/              # Exception handlers
│   │   ├── config.py           # Settings
│   │   ├── database.py         # DB engine + session
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt
│   ├── run.py                  # Uvicorn entry point
│   └── .env.example
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── functions/               # Edge functions
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── vercel.json                 # Vercel deployment config
├── render.yaml                 # Render deployment config
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+ (for backend)
- A Supabase project (free at [supabase.com](https://supabase.com))
- A Google Gemini API key (optional — falls back to local generator)

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase and API URLs
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_URL=http://localhost:8000/api/v1

# Start dev server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# SECRET_KEY=your-secret-key
# GEMINI_API_KEY=your-gemini-key (optional)

# Run the server
python run.py
# Or: uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file from `supabase/migrations/`
3. Get your project URL and anon key from Settings > API
4. Add them to your `.env` file

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user info |
| GET | `/api/v1/loans/` | List all loans |
| POST | `/api/v1/loans/` | Create a loan |
| GET | `/api/v1/loans/{id}` | Get a specific loan |
| PUT | `/api/v1/loans/{id}` | Update a loan |
| DELETE | `/api/v1/loans/{id}` | Delete a loan |
| GET | `/api/v1/profile/` | Get financial profile |
| POST | `/api/v1/profile/` | Create financial profile |
| PUT | `/api/v1/profile/` | Update financial profile |
| DELETE | `/api/v1/profile/` | Delete financial profile |
| POST | `/api/v1/settlement/predict` | Run AI settlement prediction |
| GET | `/api/v1/settlement/records` | List settlement records |
| DELETE | `/api/v1/settlement/records/{id}` | Delete a record |
| POST | `/api/v1/negotiation/generate` | Generate AI negotiation letter |
| GET | `/api/v1/history/` | List AI history |
| POST | `/api/v1/history/` | Create history entry |
| DELETE | `/api/v1/history/{id}` | Delete history entry |

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect Vite (config in `vercel.json`)
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your Render backend URL)
5. Deploy

### Backend (Render)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new Web Service
3. Connect your repository
4. Settings (auto-detected from `render.yaml`):
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS` (your Vercel frontend URL)
6. Deploy

### Environment Variables

#### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend API base URL |

#### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret key |
| `ALGORITHM` | JWT algorithm (default: HS256) |
| `DATABASE_URL` | Database connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name |
| `CORS_ORIGINS` | Allowed CORS origins |

## Scripts

### Frontend
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run typecheck` — TypeScript type checking
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

### Backend
- `python run.py` — Start the API server
- `uvicorn app.main:app --reload` — Start with hot reload

## License

MIT
