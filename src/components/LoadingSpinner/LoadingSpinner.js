import React from 'react';
import './style.css'; // Include CSS for styling the spinner

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner text-secondary"></div>
    </div>
  );
};

export default LoadingSpinner;