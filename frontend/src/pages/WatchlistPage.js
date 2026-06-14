import React, { useState, useEffect, useCallback } from 'react';
import { watchlistAPI } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import './WatchlistPage.css';

const THERAPEUTIC_AREAS = [
  'Antibiotics',
  'Antidiabetic',
  'Antifungal',
  'Antivirals',
  'Cardiovascular / ACE Inhibitors',
  'Cardiovascular / Statins',
  'CNS / Antidepressants',
  'CNS / Antipsychotics',
  'Immunology / Biologics',
  'NSAIDs / Pain Management',
  'Oncology',
  'Respiratory',
  'Other',
];

function ConfirmDialog({ drug, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#ff3b5c" strokeWidth="1.5" fill="rgba(255,59,92,0.08)"/>
            <path d="M14 9v6M14 18v1" stroke="#ff3b5c" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h3>Remove from Watchlist?</h3>
        <p>
          <strong>{drug.drugName}</strong> will no longer be scanned by the nightly AI engine.
          Existing alerts will be hidden from the dashboard.
        </p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-delete" onClick={onConfirm}>Remove Drug</button>
        </div>
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [confirmDrug, setConfirmDrug] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    drugName: '',
    genericName: '',
    therapeuticArea: '',
  });

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await watchlistAPI.getWatchlist();
      setDrugs(res.data || []);
    } catch {
      setError('Failed to load watchlist. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setAddError('');
    setAddSuccess('');
  };

  const handleAddDrug = async (e) => {
    e.preventDefault();
    if (!form.drugName.trim()) {
      setAddError('Drug name is required.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      const res = await watchlistAPI.addDrug({
        drugName: form.drugName.trim(),
        genericName: form.genericName.trim() || null,
        therapeuticArea: form.therapeuticArea || null,
      });
      setDrugs(prev => {
        const exists = prev.find(d => d.id === res.data.id);
        if (exists) return prev.map(d => d.id === res.data.id ? res.data : d);
        return [res.data, ...prev];
      });
      setAddSuccess(`"${res.data.drugName}" added to watchlist. It will be scanned in tonight's run.`);
      setForm({ drugName: '', genericName: '', therapeuticArea: '' });
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add drug. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmDrug) return;
    try {
      await watchlistAPI.removeDrug(confirmDrug.id);
      setDrugs(prev => prev.filter(d => d.id !== confirmDrug.id));
      setConfirmDrug(null);
    } catch {
      setConfirmDrug(null);
      setError('Failed to remove drug.');
    }
  };

  const activeDrugs = drugs.filter(d => d.active);
  const filteredDrugs = activeDrugs.filter(d =>
    d.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.genericName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.therapeuticArea || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout alertCount={0}>
      <div className="watchlist-content">
        <div className="watchlist-header">
          <div>
            <span className="mono-text page-eyebrow">// portfolio_watchlist</span>
            <h1 className="watchlist-title">Drug Watchlist Manager</h1>
            <p className="watchlist-subtitle">
              Manage the compounds your AI engine monitors every night. Changes take effect in the next scheduled scan.
            </p>
          </div>
          <div className="watchlist-count-pill">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#00d4ff" strokeWidth="1.2"/>
              <path d="M7 4v3.5M7 9v.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="mono-text">{activeDrugs.length} drug{activeDrugs.length !== 1 ? 's' : ''} tracked</span>
          </div>
        </div>

        <div className="watchlist-body">
          <div className="add-drug-panel">
            <div className="add-drug-panel-header">
              <h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#00d4ff" strokeWidth="1.3"/>
                  <path d="M8 5v6M5 8h6" stroke="#00d4ff" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Track New Drug
              </h2>
              <p>Add a compound to your watchlist. The AI engine will start scanning for it tonight.</p>
            </div>

            <form onSubmit={handleAddDrug} className="add-drug-form">
              {addError && (
                <div className="form-msg form-msg-error">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#ff3b5c" strokeWidth="1.2"/>
                    <path d="M7 4.5v3M7 9v.5" stroke="#ff3b5c" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="form-msg form-msg-success">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#00e676" strokeWidth="1.2"/>
                    <path d="M4 7l2.5 2.5L10 5" stroke="#00e676" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {addSuccess}
                </div>
              )}

              <div className="add-form-field">
                <label htmlFor="drugName">
                  Drug / Brand Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="drugName"
                  name="drugName"
                  value={form.drugName}
                  onChange={handleFormChange}
                  placeholder="e.g. Ibuprofen, Humira, Ozempic"
                  autoComplete="off"
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-field">
                  <label htmlFor="genericName">Generic / INN Name</label>
                  <input
                    type="text"
                    id="genericName"
                    name="genericName"
                    value={form.genericName}
                    onChange={handleFormChange}
                    placeholder="e.g. ibuprofen"
                    autoComplete="off"
                  />
                </div>
                <div className="add-form-field">
                  <label htmlFor="therapeuticArea">Therapeutic Area</label>
                  <select
                    id="therapeuticArea"
                    name="therapeuticArea"
                    value={form.therapeuticArea}
                    onChange={handleFormChange}
                  >
                    <option value="">Select area...</option>
                    {THERAPEUTIC_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="add-drug-btn" disabled={addLoading}>
                {addLoading ? (
                  <span className="btn-loading"><span className="spinner" /> Adding...</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Track This Drug
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="watchlist-table-panel">
            <div className="watchlist-table-header">
              <h2>Active Watchlist</h2>
              <div className="watchlist-search">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="var(--color-text-muted)" strokeWidth="1.2"/>
                  <path d="M9.5 9.5l3 3" stroke="var(--color-text-muted)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search drugs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="watchlist-loading">
                <span className="spinner" style={{ borderTopColor: '#00d4ff', width: 20, height: 20 }} />
                <span className="mono-text">// Loading watchlist...</span>
              </div>
            ) : error ? (
              <div className="watchlist-error">
                <p>{error}</p>
                <button onClick={fetchWatchlist} className="retry-btn">Retry</button>
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="watchlist-empty">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M22 4L40 14V30L22 40L4 30V14L22 4Z" stroke="var(--color-border-bright)" strokeWidth="1.5" fill="none"/>
                  <path d="M22 17v5M22 25v1" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {searchTerm ? (
                  <p>No drugs match "<strong>{searchTerm}</strong>"</p>
                ) : (
                  <p>No drugs on your watchlist yet.<br/>Add your first compound above.</p>
                )}
              </div>
            ) : (
              <div className="watchlist-table">
                <div className="wl-table-head">
                  <span>Drug Name</span>
                  <span>Therapeutic Area</span>
                  <span className="mono-text">Papers (last night)</span>
                  <span className="mono-text">Total Alerts</span>
                  <span>Added</span>
                  <span></span>
                </div>

                {filteredDrugs.map((drug, i) => (
                  <div
                    key={drug.id}
                    className="wl-table-row animate-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="wl-drug-cell">
                      <div className="wl-drug-indicator" />
                      <div>
                        <div className="wl-drug-name">{drug.drugName}</div>
                        {drug.genericName && (
                          <div className="wl-drug-generic">{drug.genericName}</div>
                        )}
                      </div>
                    </div>

                    <div className="wl-area-cell">
                      {drug.therapeuticArea ? (
                        <span className="wl-area-tag">{drug.therapeuticArea}</span>
                      ) : (
                        <span className="wl-no-data">—</span>
                      )}
                    </div>

                    <div className="wl-number-cell">
                      <span className="mono-text wl-number">{drug.papersScannedToday}</span>
                    </div>

                    <div className="wl-number-cell">
                      <span className={`mono-text wl-number ${drug.totalAlerts > 0 ? 'has-alerts' : ''}`}>
                        {drug.totalAlerts}
                      </span>
                    </div>

                    <div className="wl-date-cell mono-text">
                      {drug.createdAt
                        ? new Date(drug.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </div>

                    <div className="wl-action-cell">
                      <button
                        className="wl-remove-btn"
                        onClick={() => setConfirmDrug(drug)}
                        title="Remove from watchlist"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 4h10M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M6 7v4M8 7v4M3 4l.8 7.2A1 1 0 004.8 12h4.4a1 1 0 001-.8L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="watchlist-info-bar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#00d4ff" strokeWidth="1.2"/>
            <path d="M8 5v4M8 11v.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p>
            <strong>How it works:</strong> Every night at 02:00 AM UTC the AI engine reads your watchlist from this database,
            searches PubMed for new papers about each drug, and uses BioBERT to extract mentioned side effects.
            Alerts appear on your dashboard by morning.
          </p>
        </div>
      </div>

      {confirmDrug && (
        <ConfirmDialog
          drug={confirmDrug}
          onConfirm={handleRemove}
          onCancel={() => setConfirmDrug(null)}
        />
      )}
    </DashboardLayout>
  );
}