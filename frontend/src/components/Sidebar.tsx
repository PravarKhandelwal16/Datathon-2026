import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, BrainCircuit, ShieldAlert, Layers, ChevronRight } from 'lucide-react';

const COLLAPSED_W = 60;   // px — icon-only strip
const EXPANDED_W  = 260;  // px — full sidebar

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, expanded }) => (
  <NavLink
    to={to}
    end={to === '/'}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '8px',
      color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
      background: isActive ? 'var(--accent-glow)' : 'transparent',
      textDecoration: 'none',
      border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      transition: 'color 0.15s ease, background 0.15s ease, border 0.15s ease',
      minWidth: 0,
    })}
    title={!expanded ? label : undefined}
  >
    {({ isActive }) => (
      <>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'inherit' }}>
          {icon}
        </span>
        <span style={{
          fontWeight: isActive ? 600 : 500,
          fontSize: '0.9rem',
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 10001,
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        boxShadow: expanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      }}
    >
      {/* Logo / Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '1.25rem 0.85rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          background: 'var(--accent-glow)',
          padding: '0.45rem',
          borderRadius: '8px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}>
          <ShieldAlert size={24} color="var(--accent-primary)" />
        </div>
        <div style={{
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1 }}>CIAP</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>KSP Intelligence Hub</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.5rem', flex: 1 }}>
        <SidebarLink to="/"          icon={<LayoutDashboard size={20} />} label="Dashboard"             expanded={expanded} />
        <SidebarLink to="/map"       icon={<Layers size={20} />}          label="Crime Intelligence Map"  expanded={expanded} />
        <SidebarLink to="/network"   icon={<Network size={20} />}         label="Link & Network Analysis" expanded={expanded} />
        <SidebarLink to="/predictive" icon={<BrainCircuit size={20} />}   label="Predictive Insights"     expanded={expanded} />
      </nav>

      {/* Expand hint arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: expanded ? 'flex-end' : 'center',
        padding: '0.6rem 0.85rem',
        borderTop: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <ChevronRight
          size={16}
          color="var(--text-secondary)"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </div>

      {/* User profile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--accent-glow)',
          border: '1.5px solid var(--accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)' }}>SA</span>
        </div>
        <div style={{
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Admin</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>SCRB HQ</div>
        </div>
      </div>
    </aside>
  );
};
