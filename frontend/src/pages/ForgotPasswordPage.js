import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <div className="auth-container">
        <div className="auth-logo-wrap">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.4)" strokeWidth="1"/>
              <path d="M16 6L26 11V21L16 26L6 21V11L16 6Z" stroke="#00d4ff" strokeWidth="1.5" fill="none"/>
              <path d="M16 10L22 13.5V20.5L16 24L10 20.5V13.5L16 10Z" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1"/>
              <circle cx="16" cy="17" r="2.5" fill="#00d4ff"/>
            </svg>
          </div>
          <span className="auth-logo-text">PharmaWatch</span>
        </div>

        <div className="auth-card animate-in">
          {!submitted ? (
            <>
              <div className="auth-card-header">
                <h1>Reset password</h1>
                <p>Enter your work email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                  <div className="auth-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#ff3b5c" strokeWidth="1.5"/>
                      <path d="M8 5v3.5M8 11v.5" stroke="#ff3b5c" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="email">Work Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="researcher@company.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? (
                    <span className="auth-btn-loading">
                      <span className="spinner" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="auth-success">
              <div className="auth-success-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.08)"/>
                  <path d="M14 24l7 7 13-14" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Check your inbox</h2>
              <p>
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. 
                Check your spam folder if you don't see it within a few minutes.
              </p>
              <p className="auth-success-note">The link expires in 1 hour.</p>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-back-link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
