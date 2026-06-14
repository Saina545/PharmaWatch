import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const NavItem = ({ icon, label, to, active, badge }) => (
  <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
    {badge > 0 && <span className="nav-badge">{badge}</span>}
  </Link>
);

export default function DashboardLayout({ children, alertCount }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="mobile-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 6L26 11V21L16 26L6 21V11L16 6Z" stroke="#00d4ff" strokeWidth="1.5" fill="none"/>
            <circle cx="16" cy="17" r="2.5" fill="#00d4ff"/>
          </svg>
          PharmaWatch
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.3)" strokeWidth="1"/>
            <path d="M16 6L26 11V21L16 26L6 21V11L16 6Z" stroke="#00d4ff" strokeWidth="1.5" fill="none"/>
            <path d="M16 10L22 13.5V20.5L16 24L10 20.5V13.5L16 10Z" fill="rgba(0,212,255,0.1)" stroke="#00d4ff" strokeWidth="1"/>
            <circle cx="16" cy="17" r="2.5" fill="#00d4ff"/>
          </svg>
          <span>PharmaWatch</span>
        </div>

        <div className="sidebar-section-label">Intelligence</div>

        <nav className="sidebar-nav">
          <NavItem
            to="/dashboard"
            active={isActive('/dashboard')}
            badge={alertCount}
            label="Priority Feed"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            }
          />
          <NavItem
            to="/watchlist"
            active={isActive('/watchlist')}
            label="Drug Watchlist"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
          <NavItem
            to="/analytics"
            active={isActive('/analytics')}
            label="Analytics"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <polyline points="2,14 6,8 10,11 14,5 16,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </nav>

        <div className="sidebar-section-label">System</div>

        <nav className="sidebar-nav">
          <NavItem
            to="/settings"
            active={isActive('/settings')}
            label="Settings"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.5 3.5l1 1M13.5 13.5l1 1M14.5 3.5l-1 1M4.5 13.5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="sidebar-user-company">{user?.company?.name}</div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
