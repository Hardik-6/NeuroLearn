import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign dev-server WebSocket HMR disconnection notices caused by DISABLE_HMR=true
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('WebSocket closed without opened')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('[vite] failed to connect to websocket') ||
      msg.includes('WebSocket closed without opened')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

