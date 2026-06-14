import React from 'react';
import './Dashboard.css';

const accentMap = {
  blue: 'rgba(64,120,255,0.15)',
  cyan: 'rgba(0,212,255,0.15)',
  yellow: 'rgba(255,215,0,0.15)',
  red: 'rgba(255,59,92,0.15)',
};

const colorMap = {
  blue: '#4078ff',
  cyan: '#00d4ff',
  yellow: '#ffd700',
  red: '#ff3b5c',
};

export default function MetricCard({ label, value, icon, accent = 'cyan', trend, trendUp, highlight }) {
  const bg = accentMap[accent];
  const color = colorMap[accent];

  return (
    <div className={`metric-card ${highlight ? 'metric-card-highlight' : ''}`}>
      <div className="metric-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="metric-value" style={{ color: highlight ? color : undefined }}>
        {value.toLocaleString()}
        {highlight && <span className="metric-pulse" style={{ background: color }} />}
      </div>
      <div className="metric-label">{label}</div>
      {trend && (
        <div className={`metric-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
          {trendUp ? '↑' : '↓'} {trend} vs last night
        </div>
      )}
    </div>
  );
}
