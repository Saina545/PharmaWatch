import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

export default function AlertCard({ alert, onMarkRead, onClick, style }) {
  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true });

  return (
    <div
      className={`alert-card severity-${alert.severity} ${alert.read ? 'is-read' : ''}`}
      style={style}
      onClick={() => onClick && onClick(alert)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(alert)}
    >
      <div className="alert-card-top">
        <div className="alert-drug-row">
          <span className="alert-drug-name">{alert.drugName}</span>
          <span className="alert-side-effect">{alert.sideEffect}</span>
        </div>
        <div className="alert-meta-right">
          <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
          {!alert.read && <span className="unread-dot" title="Unread" />}
        </div>
      </div>

      <p className="alert-summary">{alert.summary}</p>

      <div className="alert-footer">
        <div className="alert-stats">
          <span className="alert-stat">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {alert.paperCount} {alert.paperCount === 1 ? 'study' : 'studies'}
          </span>
          <span className="alert-stat">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <polyline points="1,10 4,5 7,7 10,2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            +{alert.spikePercentage.toFixed(1)}% spike
          </span>
        </div>

        <div className="alert-actions">
          <span className="alert-time">{timeAgo}</span>
          {!alert.read && (
            <button
              className="alert-action-btn"
              onClick={(e) => { e.stopPropagation(); onMarkRead(alert.id); }}
            >
              Mark read
            </button>
          )}
          <span className="alert-view-btn">View →</span>
        </div>
      </div>
    </div>
  );
}