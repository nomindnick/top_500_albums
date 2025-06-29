import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import './UserDashboard.css';

const UserDashboard = () => {
  const [progress, setProgress] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'rating', 'rank'
  const [filterRating, setFilterRating] = useState('all'); // 'all', '5', '4', '3', '2', '1'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user progress
      const progressResponse = await axios.get('/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch user ratings
      const ratingsResponse = await axios.get('/api/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProgress(progressResponse.data);
      setRatings(ratingsResponse.data.ratings || []);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedRatings = () => {
    let filtered = [...ratings];
    
    // Apply filter
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'rating':
          return b.rating - a.rating;
        case 'rank':
          return a.album.rank - b.album.rank;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const calculateStats = () => {
    if (!progress) {
      return { completed: 0, remaining: 500, avgRating: 0, percentage: 0 };
    }
    
    // If all_completed flag is set, user has finished all 500
    if (progress.all_completed) {
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;
      return { completed: 500, remaining: 0, avgRating, percentage: 100 };
    }
    
    // Calculate based on current album
    const currentRank = progress.current_album?.rank || 500;
    const completed = 500 - currentRank;
    const remaining = currentRank;
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;
    const percentage = (completed / 500) * 100;
    
    return { completed, remaining, avgRating, percentage };
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  const stats = calculateStats();
  const displayRatings = getFilteredAndSortedRatings();

  return (
    <div className="user-dashboard">
      <h1>My Music Journey</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Albums Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.remaining}</div>
          <div className="stat-label">Albums Remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.percentage.toFixed(1)}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${stats.percentage}%` }}
          >
            <span className="progress-text">{stats.completed} / 500</span>
          </div>
        </div>
      </div>

      {progress && !progress.all_completed && progress.current_album && (
        <div className="current-album-info">
          <h3>Currently On:</h3>
          <p>#{progress.current_album.rank} - {progress.current_album.album} by {progress.current_album.artist}</p>
        </div>
      )}
      
      {progress && progress.all_completed && (
        <div className="completion-banner">
          <h3>🎉 Journey Complete!</h3>
          <p>You've listened to all 500 albums!</p>
        </div>
      )}

      <div className="ratings-section">
        <h2>My Rated Albums</h2>
        
        <div className="filters-container">
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date Rated</option>
              <option value="rating">Rating</option>
              <option value="rank">Album Rank</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Filter by rating:</label>
            <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {displayRatings.length === 0 ? (
          <p className="no-ratings">No albums rated yet. Start listening and rating!</p>
        ) : (
          <div className="ratings-grid">
            {displayRatings.map((rating) => (
              <div key={rating.id} className="rating-card">
                <div className="rating-rank">#{rating.album.rank}</div>
                <div className="rating-content">
                  <h4>{rating.album.album}</h4>
                  <p className="rating-artist">{rating.album.artist}</p>
                  <div className="rating-stars">{renderStars(rating.rating)}</div>
                  <p className="rating-date">{formatDate(rating.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;