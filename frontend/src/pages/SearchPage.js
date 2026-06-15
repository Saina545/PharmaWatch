import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dashboardAPI } from '../services/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // State to track the currently selected alert and active tab
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Prevent background scrolling when panel is open
  useEffect(() => {
    if (selectedAlert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedAlert]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedAlert(null); 
    
    try {
      const res = await dashboardAPI.searchGlobal(query);
      setResults(res.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = { CRITICAL: '#ff3b5c', HIGH: '#ff7c1a', MEDIUM: '#ffd700', INFO: '#00d4ff', LOW: '#00e676' };
    return colors[severity] || '#00d4ff';
  };

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Global Search</h1>
          <p className="dashboard-subtitle">Search the entire historical database for drugs, side effects, or papers.</p>
        </div>
      </div>

      <div className="panel-section animate-in" style={{ padding: '24px', backgroundColor: '#0c1428', borderRadius: '12px', border: '1px solid #1a2845', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Paclitaxel, Nausea, Hepatotoxicity..."
            style={{ flex: 1, padding: '14px 20px', borderRadius: '8px', backgroundColor: '#050a15', border: '1px solid #1a2845', color: '#fff', fontSize: '16px', fontFamily: 'DM Sans' }}
          />
          <button 
            type="submit" 
            disabled={isSearching}
            style={{ padding: '0 24px', backgroundColor: '#00d4ff', color: '#050a15', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSearching ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
          >
            {isSearching ? 'Searching...' : 'Search Engine'}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="animate-in">
          <h3 style={{ color: '#7a93c8', marginBottom: '16px', fontFamily: 'Space Mono', fontSize: '14px' }}>
            {results.length} results found for "{query}"
          </h3>

          {results.length === 0 && !isSearching ? (
            <div className="panel-empty" style={{ textAlign: 'center', padding: '40px', backgroundColor: '#0c1428', borderRadius: '12px', border: '1px dashed #1a2845', color: '#7a93c8' }}>
              <p>No historical data matches your search query.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((alert) => (
                <div 
                  key={alert.id} 
                  className="evidence-card" 
                  onClick={() => {
                    setSelectedAlert(alert);
                    setActiveTab('Overview');
                  }}
                  style={{ 
                    borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#0c1428'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f182f'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0c1428'}
                >
                  <div className="evidence-card-header">
                    <div className="evidence-meta">
                      <span className={`severity-badge ${alert.severity}`} style={{ backgroundColor: `${getSeverityColor(alert.severity)}20`, color: getSeverityColor(alert.severity) }}>
                        {alert.severity}
                      </span>
                      <span className="evidence-journal" style={{ marginLeft: '12px', fontWeight: 'bold', color: '#fff' }}>
                        {alert.drugName}
                      </span>
                    </div>
                    <span className="evidence-year mono-text" style={{ color: '#7a93c8' }}>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="evidence-title" style={{ fontSize: '18px', marginTop: '12px', color: '#fff' }}>
                    {alert.sideEffect}
                  </h4>
                  <p style={{ color: '#7a93c8', fontSize: '14px', lineHeight: '1.6', marginTop: '8px' }}>
                    {alert.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === EXACT MATCH DEEP DIVE PANEL === */}
      {selectedAlert && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(5, 10, 21, 0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedAlert(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '650px',
              backgroundColor: '#050a15',
              height: '100%',
              borderLeft: '1px solid #1a2845',
              boxShadow: '-15px 0 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header Section */}
            <div style={{ padding: '32px 32px 0 32px', borderBottom: '1px solid #1a2845' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '28px', margin: 0, fontFamily: 'Space Mono', fontWeight: 'bold' }}>
                  {selectedAlert.drugName}
                </h2>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  style={{ background: 'transparent', border: '1px solid #1a2845', borderRadius: '8px', color: '#7a93c8', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1a2845'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7a93c8'; }}
                >
                  ✕
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: `1px solid ${getSeverityColor(selectedAlert.severity)}`, color: getSeverityColor(selectedAlert.severity), backgroundColor: `${getSeverityColor(selectedAlert.severity)}10` }}>
                  {selectedAlert.severity}
                </span>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #1a2845', color: '#7a93c8', backgroundColor: 'transparent' }}>
                  {selectedAlert.sideEffect}
                </span>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff7c1a', fontFamily: 'Space Mono' }}>+{selectedAlert.spikePercentage}%</div>
                  <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', marginTop: '6px', textTransform: 'uppercase' }}>Signal Spike</div>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Mono' }}>{selectedAlert.paperCount}</div>
                  <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', marginTop: '6px', textTransform: 'uppercase' }}>New Papers</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', fontFamily: 'Space Mono', display: 'flex', alignItems: 'center', height: '33px' }}>Just now</div>
                  <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', marginTop: '2px', textTransform: 'uppercase' }}>Detected</div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '32px' }}>
                {['Overview', `Evidence (${selectedAlert.paperCount})`, 'Drug History'].map((tab) => {
                  const tabKey = tab.split(' ')[0];
                  const isActive = activeTab === tabKey;
                  return (
                    <button 
                      key={tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      style={{ 
                        paddingBottom: '16px', 
                        fontSize: '15px', 
                        fontWeight: isActive ? 'bold' : 'normal',
                        color: isActive ? '#00d4ff' : '#7a93c8', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Body area */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, backgroundColor: '#0c1428' }}>
              
              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {/* AI Summary Box */}
                  <div style={{ backgroundColor: '#0f182f', padding: '24px', borderRadius: '12px', border: '1px solid #1a2845', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00d4ff', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px', fontFamily: 'Space Mono' }}>
                      <span>ⓘ</span> AI SUMMARY
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: '1.7', margin: 0, fontSize: '15px' }}>
                      Automated network scan detected {selectedAlert.paperCount} mention(s) of '{selectedAlert.sideEffect}' linked to {selectedAlert.drugName} across {selectedAlert.paperCount} new publication(s). Signal spike: +{selectedAlert.spikePercentage}%. {selectedAlert.summary}
                    </p>
                  </div>

                  {/* 6-Grid Stats Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    
                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Drug</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{selectedAlert.drugName}</div>
                    </div>

                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Adverse Event</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{selectedAlert.sideEffect}</div>
                    </div>

                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Severity</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: getSeverityColor(selectedAlert.severity) }}>{selectedAlert.severity}</div>
                    </div>

                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Papers Analysed</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{selectedAlert.paperCount}</div>
                    </div>

                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Spike</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff7c1a' }}>+{selectedAlert.spikePercentage}%</div>
                    </div>

                    <div style={{ backgroundColor: '#050a15', padding: '20px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ fontSize: '11px', color: '#7a93c8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Detected</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{new Date(selectedAlert.createdAt).toLocaleString([], {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</div>
                    </div>

                  </div>

                  {/* Action Button */}
                  <button 
                    style={{ 
                      width: '100%', padding: '16px', backgroundColor: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '12px', color: '#00d4ff', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' 
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.05)'; }}
                  >
                    ✓ Mark as Investigated
                  </button>
                </div>
              )}

              {/* EXACT EVIDENCE TAB MATCH */}
              {activeTab === 'Evidence' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                  {selectedAlert.papers && selectedAlert.papers.map((paper, idx) => (
                    <div key={paper.pmid || idx} style={{ backgroundColor: '#050a15', padding: '24px', borderRadius: '12px', border: '1px solid #1a2845' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: 'Space Mono', fontSize: '12px' }}>
                        <span style={{ color: '#3b5284' }}>{String(idx + 1).padStart(2, '0')}</span>
                        <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>PubMed</span>
                        <span style={{ color: '#3b5284' }}>{paper.pubYear}</span>
                      </div>
                      
                      <h6 style={{ color: '#fff', fontSize: '16px', marginBottom: '24px', lineHeight: '1.4', fontWeight: 'bold' }}>
                        {paper.title}
                      </h6>
                      
                      <a 
                        href={paper.pubmedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          border: '1px solid rgba(0, 212, 255, 0.3)', 
                          backgroundColor: 'rgba(0, 212, 255, 0.05)',
                          padding: '10px 16px', 
                          borderRadius: '6px', 
                          textDecoration: 'none', 
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.05)'}
                      >
                        <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          Read on PubMed
                        </span>
                        <span style={{ color: '#3b5284', fontFamily: 'Space Mono', fontSize: '13px' }}>
                          PMID: {paper.pmid}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* EXACT DRUG HISTORY TAB MATCH */}
              {activeTab === 'Drug' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <p style={{ color: '#7a93c8', fontSize: '15px', marginBottom: '24px' }}>
                    All recorded adverse event signals for <strong style={{ color: '#fff' }}>{selectedAlert.drugName}</strong> in your watchlist.
                  </p>

                  {/* Chart Container */}
                  <div style={{ backgroundColor: '#050a15', borderRadius: '12px', border: '1px solid #1a2845', padding: '40px 24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', position: 'relative', height: '120px' }}>
                      {/* Y-axis label */}
                      <div style={{ width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '16px', color: '#7a93c8', fontSize: '12px' }}>
                        {selectedAlert.sideEffect}
                      </div>

                      {/* Grid and Bars */}
                      <div style={{ flex: 1, position: 'relative', borderLeft: '1px dashed #1a2845' }}>
                        {/* Vertical Grid Lines */}
                        {[0, 1, 2, 3, 4].map(num => (
                          <div key={num} style={{ position: 'absolute', left: `${(num / 4) * 100}%`, top: 0, bottom: 0, borderLeft: num > 0 ? '1px dashed #1a2845' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <span style={{ position: 'absolute', bottom: '-30px', transform: 'translateX(-50%)', color: '#3b5284', fontSize: '12px', fontFamily: 'Space Mono' }}>{num}</span>
                          </div>
                        ))}
                        
                        {/* Dynamic Bar (Fixed to 1 alert logically for search scans) */}
                        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, height: '24px', width: '25%', backgroundColor: '#ff7c1a', borderRadius: '0 4px 4px 0', zIndex: 1 }}></div>
                      </div>
                    </div>
                  </div>

                  {/* List Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', marginBottom: '12px', color: '#3b5284', fontSize: '11px', fontFamily: 'Space Mono', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    <div>Side Effect</div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                      <span>Alerts</span>
                      <span>Avg Spike</span>
                    </div>
                  </div>

                  {/* List Data Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#050a15', borderRadius: '8px', border: '1px solid #1a2845', borderLeft: '3px solid #ff7c1a', padding: '16px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{selectedAlert.sideEffect}</div>
                    <div style={{ display: 'flex', gap: '48px', alignItems: 'center', fontFamily: 'Space Mono' }}>
                      <span style={{ color: '#7a93c8', fontSize: '14px' }}>1</span>
                      <span style={{ color: '#ff7c1a', fontSize: '14px', fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>+{selectedAlert.spikePercentage}%</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

    </DashboardLayout>
  );
}