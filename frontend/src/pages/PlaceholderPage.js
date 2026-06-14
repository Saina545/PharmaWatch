import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function PlaceholderPage({ title, description }) {
  return (
    <DashboardLayout alertCount={0}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: 'calc(100vh - 80px)', gap: '1rem',
        color: 'var(--color-text-muted)',
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="var(--color-border-bright)" strokeWidth="1.5" fill="none"/>
          <circle cx="24" cy="24" r="4" fill="var(--color-border-bright)"/>
        </svg>
        <h2 style={{ fontFamily: 'Space Mono, monospace', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {description || 'This section is coming in the next sprint.'}
        </p>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          // TODO: implement
        </span>
      </div>
    </DashboardLayout>
  );
}
