import React from 'react';
import './AppLoader.css';

const AppLoader = () => {
  return (
    <div className="app-loader">
      <div className="loader-content">
        <div className="spinner"></div>
        <p>Loading 500 Albums Countdown...</p>
      </div>
    </div>
  );
};

export default AppLoader;