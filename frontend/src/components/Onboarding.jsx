import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Onboarding.css';

const Onboarding = () => {
  const [albums, setAlbums] = useState([]);
  const [selectedRank, setSelectedRank] = useState(500);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/albums');
      setAlbums(response.data.albums);
      setError(null);
    } catch (err) {
      setError('Failed to fetch albums');
      console.error('Error fetching albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFromBeginning = async () => {
    await initializeProgress(500);
  };

  const handleSelectPosition = async () => {
    await initializeProgress(selectedRank);
  };

  const initializeProgress = async (rank) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await axios.post('http://localhost:5000/api/progress/initialize', {
        album_rank: rank
      });
      
      // Navigate to countdown page
      navigate('/countdown');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize progress');
      console.error('Error initializing progress:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAlbums = albums.filter(album => {
    const searchLower = searchTerm.toLowerCase();
    return (
      album.artist.toLowerCase().includes(searchLower) ||
      album.album.toLowerCase().includes(searchLower) ||
      album.rank.toString().includes(searchTerm)
    );
  });

  if (loading) {
    return <div className="loading">Loading albums...</div>;
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Welcome to the 500 Albums Countdown!</h1>
        <p>Let's get you started on your musical journey through Rolling Stone's Top 500 Albums of All Time.</p>
      </div>

      <div className="onboarding-options">
        <div className="option-card">
          <h2>Start Fresh</h2>
          <p>Begin your journey from album #500 and work your way to #1</p>
          <button 
            className="primary-button"
            onClick={handleStartFromBeginning}
            disabled={submitting}
          >
            {submitting ? 'Setting up...' : 'Start from the Beginning'}
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="option-card">
          <h2>Pick Up Where You Left Off</h2>
          <p>Already started listening? Select the album you're currently on:</p>
          
          <div className="album-search">
            <input
              type="text"
              placeholder="Search by artist, album, or rank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="album-selector">
            <select 
              value={selectedRank} 
              onChange={(e) => setSelectedRank(Number(e.target.value))}
              className="album-dropdown"
              size="10"
            >
              {filteredAlbums.map(album => (
                <option key={album.id} value={album.rank}>
                  #{album.rank} - {album.artist} - {album.album}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="primary-button"
            onClick={handleSelectPosition}
            disabled={submitting}
          >
            {submitting ? 'Setting up...' : `Continue from Album #${selectedRank}`}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Onboarding;