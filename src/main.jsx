// In your main.jsx or App.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeFCM } from './firebase-config';
import './index.css';

// Initialize Firebase Cloud Messaging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    initializeFCM()
      .then(token => {
        if (token) {
          console.log('FCM 초기화 완료, 토큰:', token);
        }
      })
      .catch(err => {
        console.error('FCM 초기화 오류:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);