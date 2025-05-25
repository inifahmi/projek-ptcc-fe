import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Jika Anda punya file CSS ini
import App from './App';
import 'bulma/css/bulma.min.css'; // Pastikan ini ada

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);