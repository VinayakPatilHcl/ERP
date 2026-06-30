import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              borderRadius: 12,
              background: '#14151f',
              color: '#e7e9f2',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px -10px rgba(0,0,0,0.6)',
            },
            success: { iconTheme: { primary: '#8b5cf6', secondary: 'white' } },
            error: { iconTheme: { primary: '#f87171', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
