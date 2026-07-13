import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, BrainCircuit, ShieldAlert, Layers } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="sidebar glass-panel" style={{ width: '260px', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
        <div style={{ background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '8px' }}>
          <ShieldAlert size={28} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>CIAP</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KSP Intelligence Hub</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/map" icon={<Layers size={20} />} label="Crime Intelligence Map" />
        <SidebarLink to="/network" icon={<Network size={20} />} label="Network Analysis" />
        <SidebarLink to="/predictive" icon={<BrainCircuit size={20} />} label="Predictive Insights" />
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>SA</span>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Admin</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SCRB HQ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-glow)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
      })}
    >
      {({ isActive }) => (
        <>
          {icon}
          <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem' }}>{label}</span>
        </>
      )}
    </NavLink>
  );
};
