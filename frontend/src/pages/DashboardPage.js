import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import MetricCard from '../components/dashboard/MetricCard';
import AlertCard from '../components/dashboard/AlertCard';
import AlertTrendChart from '../components/dashboard/AlertTrendChart';
import AlertDetailPanel from '../components/dashboard/AlertDetailPanel';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleMarkRead = async (alertId) => {
    try {
      await dashboardAPI.markAlertRead(alertId);
      setData(prev => ({
        ...prev,
        alertFeed: prev.alertFeed.map(a =>
          a.id === alertId ? { ...a, read: true } : a
        ),
        metrics: {
          ...prev.metrics,
          unreadAlerts: Math.max(0, prev.metrics.unreadAlerts - 1),
          newAlertsToday: Math.max(0, prev.metrics.newAlertsToday - 1),
        }
      }));
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(prev => ({ ...prev, read: true }));
      }
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleAlertClick = async (alert) => {
    // Immediately open with the data we have (papers from full feed)
    setSelectedAlert(alert);
    // Fetch full detail (with papers) from backend
    try {
      const res = await dashboardAPI.getAlertDetail(alert.id);
      setSelectedAlert(res.data);
    } catch {
      // keep the alert data we already have
    }
  };

  const handlePanelClose = () => setSelectedAlert(null);

  const filteredAlerts = data?.alertFeed?.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'critical') return alert.severity === 'CRITICAL';
    if (filter === 'high') return alert.severity === 'HIGH';
    return true;
  }) || [];

  const unreadCount = data?.alertFeed?.filter(a => !a.read).length || 0;

  if (loading) {
    return (
      <DashboardLayout alertCount={0}>
        <div className="dashboard-loading">
          <div className="loading-hexagon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L44 15V33L24 44L4 33V15L24 4Z" stroke="#00d4ff" strokeWidth="1.5" fill="none" strokeDasharray="80" strokeDashoffset="80">
                <animate attributeName="stroke-dashoffset" from="80" to="0" dur="1s" fill="freeze"/>
              </path>
            </svg>
          </div>
          <p className="mono-text">// Loading intelligence feed...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout alertCount={0}>
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={fetchDashboard} className="retry-btn">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout alertCount={unreadCount}>
      <div className="dashboard-content">
        {/* Page header */}
        <div className="dashboard-header">
          <div>
            <div className="dashboard-greeting">
              <span className="mono-text greeting-time"></span>
            </div>
            <h1 className="dashboard-title">
              Good {getTimeOfDay()}, {user?.firstName}
            </h1>
            <p className="dashboard-subtitle">
              Here's your overnight intelligence report for <strong>{user?.company?.name}</strong>
            </p>
          </div>
          <div className="dashboard-scan-status">
            <div className="scan-indicator" />
            <span>Last scan: 02:14 AM UTC</span>
          </div>
        </div>

        {/* Metric cards */}
        <div className="metrics-grid">
          <MetricCard
            label="Drugs Tracked"
            value={data?.metrics?.totalDrugsTracked || 0}
            icon="💊"
            accent="blue"
            trend={null}
          />
          <MetricCard
            label="Papers Scanned Tonight"
            value={data?.metrics?.papersScanedToday || 0}
            icon="📄"
            accent="cyan"
            trend="+12%"
            trendUp={true}
          />
          <MetricCard
            label="New Alerts"
            value={data?.metrics?.newAlertsToday || 0}
            icon="🔔"
            accent="yellow"
            trend={null}
          />
          <MetricCard
            label="Critical Signals"
            value={data?.metrics?.criticalAlerts || 0}
            icon="🚨"
            accent="red"
            highlight={data?.metrics?.criticalAlerts > 0}
            trend={null}
          />
        </div>

        {/* Chart + Feed layout */}
        <div className="dashboard-body">
          {/* Alert feed */}
          <div className="feed-column">
            <div className="feed-header">
              <div className="feed-title-row">
                <h2 className="feed-title">Alert Feed</h2>
                {unreadCount > 0 && (
                  <span className="feed-unread-badge">{unreadCount} new</span>
                )}
              </div>
              <div className="feed-filters">
                {['all', 'unread', 'critical', 'high'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="alert-feed">
              {filteredAlerts.length === 0 ? (
                <div className="feed-empty">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="var(--color-border-bright)" strokeWidth="1.5"/>
                    <path d="M20 14v8M20 26v1" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>No alerts matching this filter</p>
                </div>
              ) : (
                filteredAlerts.map((alert, i) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkRead={handleMarkRead}
                    onClick={handleAlertClick}
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right column - charts */}
          <div className="chart-column">
            <div className="chart-card">
              <div className="chart-card-header">
                <h3>Signal Activity (7 days)</h3>
                <span className="chart-subtitle mono-text">// alerts by severity</span>
              </div>
              <AlertTrendChart alerts={data?.alertFeed || []} />
            </div>

            <div className="drug-breakdown-card">
              <div className="chart-card-header">
                <h3>Top Drugs by Alerts</h3>
              </div>
              <div className="drug-list">
                {getDrugBreakdown(data?.alertFeed || []).map((drug, i) => (
                  <div key={drug.name} className="drug-row">
                    <span className="drug-rank mono-text">{String(i + 1).padStart(2, '0')}</span>
                    <span className="drug-name">{drug.name}</span>
                    <div className="drug-bar-wrap">
                      <div
                        className="drug-bar"
                        style={{
                          width: `${(drug.count / (getDrugBreakdown(data?.alertFeed || [])[0]?.count || 1)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="drug-count mono-text">{drug.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-dive slide panel */}
      {selectedAlert && (
        <AlertDetailPanel
          alert={selectedAlert}
          onClose={handlePanelClose}
          onMarkRead={handleMarkRead}
        />
      )}
    </DashboardLayout>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getDrugBreakdown(alerts) {
  const counts = {};
  alerts.forEach(a => {
    counts[a.drugName] = (counts[a.drugName] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}