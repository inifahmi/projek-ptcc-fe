// src/components/LoadingSpinner.js
import React from 'react';

function LoadingSpinner() {
  return (
    <div className="has-text-centered">
      <progress className="progress is-small is-primary" max="100">15%</progress>
      <p>Memuat...</p>
    </div>
  );
}

export default LoadingSpinner;