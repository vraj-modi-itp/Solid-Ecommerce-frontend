import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically prompts the browser to grab the latest deployed code
    if (confirm('A new version of SOLID is available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('SOLID is ready to be used offline.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);