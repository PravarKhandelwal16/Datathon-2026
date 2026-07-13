import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Strategic Overview</h1>
            <p style={{ margin: 0, marginTop: '0.25rem' }}>Real-time intelligence and analytics dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleTheme} 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="pulse-alert" style={{ width: '8px', height: '8px', background: 'var(--success)' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Online</span>
            </div>
          </div>
        </header>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
