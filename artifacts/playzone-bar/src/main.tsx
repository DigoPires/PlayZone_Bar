import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';
import { setBaseUrl } from '@workspace/api-client-react';

// Set API base URL from environment.
// If VITE_API_URL points to localhost (developer machine), ignore it for builds
// on the hosting provider so the client uses the same origin for API calls.
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const apiUrl = rawApiUrl && !rawApiUrl.includes('localhost') ? rawApiUrl : null;
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
