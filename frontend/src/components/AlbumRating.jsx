import React, { useState } from 'react';
import './AlbumRating.css';

const AlbumRating = ({ album, onSubmit, onSkip }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    await onSubmit(rating);
    setSubmitting(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="album-rating">
      <h2>Rate this album</h2>
      
      <div className="rating-album-info">
        <h3>{album.album}</h3>
        <p>by {album.artist}</p>
      </div>
      
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${star <= displayRating ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={submitting}
          >
            ★
          </button>
        ))}
      </div>
      
      <div className="rating-actions">
        <button
          className="submit-rating"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
        
        <button
          className="skip-rating"
          onClick={onSkip}
          disabled={submitting}
        >
          Skip Rating
        </button>
      </div>
    </div>
  );
};

export default AlbumRating;