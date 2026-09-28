import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function initApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    // Retry once body is ready if mounted early
    setTimeout(() => {
      const el = document.getElementById('root');
      if (el) {
        createRoot(el).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
      }
    }, 50);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
