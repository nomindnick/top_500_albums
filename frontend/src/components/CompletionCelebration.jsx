import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './CompletionCelebration.css';

const CompletionCelebration = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletionStats();
  }, []);

  const fetchCompletionStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/ratings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ratings = response.data.ratings || [];
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const fiveStars = ratings.filter(r => r.rating === 5).length;
      const topRated = ratings
        .filter(r => r.rating === 5)
        .sort((a, b) => a.album.rank - b.album.rank)
        .slice(0, 5);
      
      setStats({
        totalAlbums: 500,
        avgRating: avgRating.toFixed(1),
        fiveStars,
        topRated,
        completionDate: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error('Failed to fetch completion stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="celebration-loading">Loading your journey summary...</div>;
  }

  return (
    <div className="completion-celebration">
      <div className="celebration-content">
        <div className="trophy-icon">🏆</div>
        <h1>Congratulations!</h1>
        <h2>You've completed the Rolling Stone Top 500 Albums Journey!</h2>
        
        {stats && (
          <div className="journey-stats">
            <div className="stat-item">
              <div className="stat-number">500</div>
              <div className="stat-label">Albums Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.avgRating}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.fiveStars}</div>
              <div className="stat-label">Five Star Albums</div>
            </div>
          </div>
        )}

        <div className="celebration-message">
          <p>What an incredible achievement! You've listened to and rated all 500 of Rolling Stone's greatest albums of all time.</p>
          <p>Your musical journey is complete, but your love for music continues!</p>
        </div>

        {stats && stats.topRated.length > 0 && (
          <div className="top-favorites">
            <h3>Your Top Rated Albums</h3>
            <ul>
              {stats.topRated.map((rating) => (
                <li key={rating.id}>
                  #{rating.album.rank} - {rating.album.album} by {rating.album.artist}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/dashboard" className="btn-primary">
            View Full Journey
          </Link>
          <button className="btn-secondary" onClick={() => window.print()}>
            Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionCelebration;