import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { dashboardAPI } from '../../services/api';
import './AlertDetailPanel.css';

const SEVERITY_COLOR = {
  CRITICAL: '#ff3b5c',
  HIGH: '#ff7c1a',
  MEDIUM: '#ffd700',
  LOW: '#00e676',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1428', border: '1px solid #1a2845',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
      fontFamily: 'Space Mono, monospace',
    }}>
      <p style={{ color: '#7a93c8', marginBottom: 4 }}>{label}</p>
      <p style={{ color: payload[0].fill }}>{payload[0].value} alerts</p>
    </div>
  );
};

export default function AlertDetailPanel({ alert, onClose, onMarkRead }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchHistory = useCallback(async () => {
    if (!alert) return;
    setHistoryLoading(true);
    try {
      const res = await dashboardAPI.getDrugHistory(alert.drugName);
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    fetchHistory();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [fetchHistory]);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!alert) return null;

  const severity = alert.severity;
  const accentColor = SEVERITY_COLOR[severity] || '#00d4ff';
  
 const safeGetDistance = (dateVal) => {
    try {
      let parsed = new Date();
      if (Array.isArray(dateVal)) {
        parsed = new Date(dateVal[0], (dateVal[1] || 1) - 1, dateVal[2] || 1, dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
      } else if (dateVal) {
        parsed = new Date(dateVal);
      }
      if (isNaN(parsed.getTime())) parsed = new Date();
      return formatDistanceToNow(parsed, { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  const safeFormatDate = (dateVal) => {
    try {
      let parsed = new Date();
      if (Array.isArray(dateVal)) {
        parsed = new Date(dateVal[0], (dateVal[1] || 1) - 1, dateVal[2] || 1, dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
      } else if (dateVal) {
        parsed = new Date(dateVal);
      }
      if (isNaN(parsed.getTime())) parsed = new Date();
      return format(parsed, 'MMM d, yyyy HH:mm');
    } catch (e) {
      return "Just now";
    }
  };
  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <aside className="detail-panel">
        {/* Header */}
        <div className="panel-header" style={{ borderTopColor: accentColor }}>
          <div className="panel-header-top">
            <div className="panel-drug-info">
              <h2 className="panel-drug-name">{alert.drugName}</h2>
              <div className="panel-badges">
                <span className={`severity-badge ${severity}`}>{severity}</span>
                <span className="panel-side-effect-badge">{alert.sideEffect}</span>
              </div>
            </div>
            <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="panel-stats-row">
            <div className="panel-stat">
              <span className="panel-stat-value" style={{ color: accentColor }}>
                +{alert.spikePercentage?.toFixed(1)}%
              </span>
              <span className="panel-stat-label">Signal Spike</span>
            </div>
            <div className="panel-stat">
              <span className="panel-stat-value">{alert.paperCount}</span>
              <span className="panel-stat-label">New Papers</span>
            </div>
            <div className="panel-stat">
              <span className="panel-stat-value">
             {safeGetDistance(alert.createdAt)}
              </span>
              <span className="panel-stat-label">Detected</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="panel-tabs">
          {['overview', 'evidence', 'history'].map(tab => (
            <button
              key={tab}
              className={`panel-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'evidence' ? `Evidence (${alert.papers?.length || 0})` : 'Drug History'}
            </button>
          ))}
        </div>

        {/* Panel body */}
        <div className="panel-body">
          {activeTab === 'overview' && (
            <div className="panel-section animate-in">
              <div className="panel-summary-card">
                <div className="panel-summary-label">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#00d4ff" strokeWidth="1.2"/>
                    <path d="M7 4.5v3.5M7 9.5v.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  AI Summary
                </div>
                <p className="panel-summary-text">{alert.summary}</p>
              </div>
              <div className="panel-info-grid">
                <div className="panel-info-item">
                  <span className="panel-info-label">Drug</span>
                  <span className="panel-info-value">{alert.drugName}</span>
                </div>
                <div className="panel-info-item">
                  <span className="panel-info-label">Adverse Event</span>
                  <span className="panel-info-value">{alert.sideEffect}</span>
                </div>
                <div className="panel-info-item">
                  <span className="panel-info-label">Severity</span>
                  <span className="panel-info-value" style={{ color: accentColor }}>{severity}</span>
                </div>
                <div className="panel-info-item">
                  <span className="panel-info-label">Papers Analysed</span>
                  <span className="panel-info-value">{alert.paperCount}</span>
                </div>
                <div className="panel-info-item">
                  <span className="panel-info-label">Spike</span>
                  <span className="panel-info-value" style={{ color: accentColor }}>
                    +{alert.spikePercentage?.toFixed(1)}%
                  </span>
                </div>
                <div className="panel-info-item">
                  <span className="panel-info-label">Detected</span>
                  <span className="panel-info-value">
                 {safeFormatDate(alert.createdAt)}
                  </span>
                </div>
              </div>
              {!alert.read && (
                <button
                  className="panel-mark-read-btn"
                  onClick={() => { onMarkRead(alert.id); onClose(); }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mark as Reviewed
                </button>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="panel-section animate-in">
              {!alert.papers || alert.papers.length === 0 ? (
                <div className="panel-empty">
                  <p>No individual paper evidence attached to this alert.</p>
                </div>
              ) : (
                <div className="evidence-list">
                  {alert.papers.map((paper, i) => (
                    <div key={paper.pmid || i} className="evidence-card">
                      <div className="evidence-card-header">
                        <span className="evidence-index mono-text">{String(i + 1).padStart(2, '0')}</span>
                        <div className="evidence-meta">
                          <span className="evidence-journal">{paper.journal}</span>
                          <span className="evidence-year mono-text">{paper.pubYear}</span>
                        </div>
                      </div>
                      <h4 className="evidence-title">{paper.title}</h4>
                      <p className="evidence-authors">{paper.authors}</p>
                      {paper.abstractSnippet && (
                        <blockquote className="evidence-abstract">
                          "{paper.abstractSnippet}"
                        </blockquote>
                      )}
                      <a
                        href={paper.pubmedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-link"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 1h4m0 0v4m0-4L5.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Read on PubMed
                        {paper.pmid && <span className="evidence-pmid">PMID: {paper.pmid}</span>}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="panel-section animate-in">
              <p className="panel-section-desc">
                All recorded adverse event signals for <strong>{alert.drugName}</strong> in your watchlist.
              </p>
              {historyLoading ? (
                <div className="panel-loading">
                  <span className="spinner" style={{ borderTopColor: '#00d4ff' }} />
                  Loading history...
                </div>
              ) : history.length === 0 ? (
                <div className="panel-empty">
                  <p>No historical data available yet.</p>
                </div>
              ) : (
                <>
                  <div className="history-chart-wrap">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={history} barSize={20} layout="vertical"
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2845" horizontal={false} />
                        <XAxis
                          type="number" dataKey="count"
                          tick={{ fill: '#3d5a8a', fontSize: 10, fontFamily: 'Space Mono' }}
                          axisLine={false} tickLine={false} allowDecimals={false}
                        />
                        <YAxis
                          type="category" dataKey="sideEffect" width={110}
                          tick={{ fill: '#7a93c8', fontSize: 10, fontFamily: 'DM Sans' }}
                          axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {history.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.sideEffect === alert.sideEffect ? accentColor : '#1a2845'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="history-table">
                    <div className="history-table-header">
                      <span>Side Effect</span>
                      <span>Alerts</span>
                      <span>Avg Spike</span>
                    </div>
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className={`history-table-row ${h.sideEffect === alert.sideEffect ? 'highlighted' : ''}`}
                        style={h.sideEffect === alert.sideEffect ? { borderLeftColor: accentColor } : {}}
                      >
                        <span className="history-effect">{h.sideEffect}</span>
                        <span className="history-count mono-text">{h.count}</span>
                        <span className="history-spike mono-text" style={{ color: accentColor }}>
                          +{h.avgSpike?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}