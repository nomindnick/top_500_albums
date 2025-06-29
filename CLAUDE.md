# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"500 Top Albums Countdown" - A full-stack web application for tracking progress through Rolling Stone's Top 500 Albums of All Time (2020 edition). Users systematically listen to albums from #500 to #1, tracking progress and rating albums.

## Common Development Commands

### Frontend (React + Vite)
```bash
# Install dependencies
cd frontend && npm install

# Run development server (port 5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Backend (Flask)
```bash
# Install dependencies
cd backend && pip install -r requirements.txt

# Run development server
python run.py

# Database migrations
flask db init     # Initialize migrations (already done)
flask db migrate -m "Description"  # Create new migration
flask db upgrade  # Apply migrations

# Seed database with album data
python seed.py
```

### Database Setup
```bash
# PostgreSQL database configuration
# Database: albums_countdown_db
# User: albums_countdown_user
# Password: nick6196
# Default connection string in backend/app/config.py
```

## High-Level Architecture

### Technology Stack
- **Frontend**: React 19.1.0 with Vite, React Router DOM, Axios
- **Backend**: Flask with SQLAlchemy ORM, Flask-Migrate
- **Database**: PostgreSQL
- **State Management**: React hooks (useState, useEffect)
- **API**: RESTful endpoints under `/api/`

### Core Models & Database Schema

1. **User** - Authentication and user accounts
2. **Album** - Static data for all 500 albums (rank, artist, album, info, description)
3. **UserProgress** - Tracks each user's current position (one-to-one with User)
4. **UserRating** - Stores user ratings for completed albums

### API Structure

Authentication endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

Progress tracking:
- `GET /api/progress` - Get current album for user
- `POST /api/progress/complete` - Mark album complete, advance to next

Album data:
- `GET /api/albums` - Get all albums (for onboarding)

Ratings:
- `POST /api/ratings` - Submit album rating
- `GET /api/ratings` - Get user's album ratings

### Key Design Patterns

1. **Flask Application Factory** - Used in `backend/app/__init__.py` for app creation
2. **Blueprint Registration** - API routes organized as Flask blueprints
3. **SQLAlchemy Relationships** - Proper foreign keys and backrefs between models
4. **Component-Based Frontend** - React components in `frontend/src/components/`

### Development Workflow

1. Backend changes require database migrations if models are modified
2. Frontend runs on port 5173, backend typically on port 5000
3. Use environment variables for sensitive config (DATABASE_URL)
4. Album data comes from `rolling_stone_top_500_albums_2020.csv`

### Current Development Phase

Project has completed Phase 1 (MVP) with all core functionality implemented:
- ✅ User authentication with JWT
- ✅ Album countdown flow (#500 to #1)
- ✅ Progress tracking
- ✅ Album rating system
- ✅ User dashboard with statistics
- ✅ Onboarding flow for new users
- ✅ Completion celebration for finishing all 500 albums
- ✅ Comprehensive error handling and edge cases

### Recent Implementations

1. **User Dashboard** (`frontend/src/components/UserDashboard.jsx`)
   - Progress statistics (albums completed, remaining, average rating)
   - Visual progress bar
   - Rated albums list with sorting/filtering
   - Mobile responsive design

2. **Completion Flow** (`frontend/src/components/CompletionCelebration.jsx`)
   - Celebration page when user completes all 500 albums
   - Journey statistics and achievements
   - Top-rated albums display

3. **Error Handling & Edge Cases**
   - Global axios interceptors (`frontend/src/utils/axiosConfig.js`)
   - Session expiration handling with auto-redirect
   - Network error detection
   - Data validation improvements
   - API response error handling

4. **Backend Improvements**
   - Added `all_completed` flag to progress endpoints
   - Better error responses
   - Session validation

### Known Issues & Considerations

- Frontend API calls now use relative URLs (no hardcoded localhost)
- JWT tokens expire after 24 hours
- Database uses PostgreSQL with specific credentials
- Album data must be seeded from CSV file