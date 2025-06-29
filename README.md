# 500 Top Albums Countdown

A full-stack web application for tracking your journey through Rolling Stone's Top 500 Albums of All Time (2020 edition). Listen to albums from #500 to #1, track your progress, and rate each album along the way.

## Features

### Core Functionality
- **Album Countdown**: Progress through all 500 albums from last to first
- **User Authentication**: Secure registration and login with JWT tokens
- **Progress Tracking**: Automatic tracking of your current album position
- **Album Rating**: Rate each album on a 5-star scale after listening
- **Flexible Start**: Choose to start from album #500 or any specific album

### User Dashboard
- **Progress Statistics**: View albums completed, remaining, average rating, and completion percentage
- **Visual Progress Bar**: See your journey progress at a glance
- **Rated Albums List**: Browse all your rated albums with sorting and filtering options
- **Current Album Display**: Quick view of which album you're currently on

### Edge Case Handling
- **Completion Celebration**: Special celebration page when you finish all 500 albums
- **Session Management**: Automatic logout and redirect on token expiration
- **Error Handling**: Comprehensive error messages and network failure detection
- **Data Validation**: Robust handling of edge cases and data integrity

## Tech Stack

### Frontend
- React 19.1.0 with Vite
- React Router for navigation
- Axios for API calls with interceptors
- CSS for styling (mobile responsive)

### Backend
- Flask with SQLAlchemy ORM
- PostgreSQL database
- Flask-Migrate for database migrations
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.x
- PostgreSQL

### Database Setup
```bash
# Create PostgreSQL database
createdb albums_countdown_db

# Create user (update password as needed)
createuser -P albums_countdown_user
# Password: nick6196
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
flask db upgrade

# Seed database with album data
python seed.py

# Start backend server
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
top_500_albums/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── CurrentAlbum.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── CompletionCelebration.jsx
│   │   │   ├── AlbumRating.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   ├── utils/             # Utility functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py       # Flask app factory
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── routes.py         # API endpoints
│   │   └── config.py         # Configuration
│   ├── migrations/           # Database migrations
│   ├── requirements.txt
│   └── run.py
│
└── rolling_stone_top_500_albums_2020.csv  # Album data
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Progress
- `GET /api/progress` - Get user's current album
- `POST /api/progress/initialize` - Set starting album
- `POST /api/progress/complete` - Mark current album as complete

### Albums & Ratings
- `GET /api/albums` - Get all albums
- `POST /api/ratings` - Submit album rating
- `GET /api/ratings` - Get user's ratings

## Recent Updates

### User Dashboard Implementation
- Added comprehensive dashboard showing progress statistics
- Implemented sorting and filtering for rated albums
- Added visual progress bar and completion percentage

### Edge Case Fixes
- Created celebration page for journey completion
- Added global error handling with axios interceptors
- Implemented automatic session management
- Fixed hardcoded API URLs
- Added network error detection
- Improved data validation throughout the app

### UI/UX Improvements
- Mobile responsive design for dashboard
- Better error messages and user feedback
- Loading states and error boundaries
- Prevented double-click submissions

## Future Enhancements

- Album artwork integration
- Social features (share progress)
- Export ratings to CSV
- Album search and browse functionality
- Achievement badges
- Listening history timeline

## License

This project is for educational purposes, tracking albums from Rolling Stone's Top 500 Albums of All Time (2020 edition).