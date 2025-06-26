import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import AlbumRating from './AlbumRating';
import './CurrentAlbum.css';

const CurrentAlbum = () => {
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCurrentAlbum = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/progress');
      setCurrentAlbum(response.data.current_album);
      setError(null);
    } catch (err) {
      // Check if user needs onboarding
      if (err.response?.status === 404 && err.response?.data?.needs_onboarding) {
        navigate('/onboarding');
        return;
      }
      setError('Failed to fetch current album');
      console.error('Error fetching current album:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAlbum();
  }, [isAuthenticated]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/progress/complete');
      
      if (response.data.message.includes('Congratulations')) {
        setCurrentAlbum(null);
        setError(response.data.message);
      } else {
        setShowRating(true);
      }
    } catch (err) {
      setError('Failed to complete album');
      console.error('Error completing album:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    try {
      await axios.post('http://localhost:5000/api/ratings', {
        album_id: currentAlbum.id,
        rating: rating
      });
      
      setShowRating(false);
      await fetchCurrentAlbum();
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading your current album...</div>;
  }

  if (error && !currentAlbum) {
    return <div className="error">{error}</div>;
  }

  if (!currentAlbum) {
    return <div className="no-album">No album data available. Please try again later.</div>;
  }

  if (showRating) {
    return (
      <AlbumRating 
        album={currentAlbum} 
        onSubmit={handleRatingSubmit}
        onSkip={() => {
          setShowRating(false);
          fetchCurrentAlbum();
        }}
      />
    );
  }

  return (
    <div className="current-album">
      <div className="album-header">
        <h1>Album #{currentAlbum.rank}</h1>
      </div>
      
      <div className="album-content">
        <h2 className="album-title">{currentAlbum.album}</h2>
        <h3 className="artist-name">by {currentAlbum.artist}</h3>
        
        {currentAlbum.info && (
          <p className="album-info">{currentAlbum.info}</p>
        )}
        
        {currentAlbum.description && (
          <div className="album-description">
            <h4>About this album:</h4>
            <p>{currentAlbum.description}</p>
          </div>
        )}
      </div>
      
      <div className="album-actions">
        <button 
          className="complete-button"
          onClick={handleComplete}
          disabled={completing}
        >
          {completing ? 'Processing...' : 'Mark as Complete'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CurrentAlbum;