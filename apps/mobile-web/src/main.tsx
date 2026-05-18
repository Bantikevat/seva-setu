/**
 * MAIN — App entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { restoreReminders } from './utils/booking-reminder';

// Re-register any pending booking reminders (handles page refresh)
restoreReminders();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
