import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';
import { setBaseUrl } from '@workspace/api-client-react';

// Set API base URL from environment
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
setBaseUrl(apiUrl);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
