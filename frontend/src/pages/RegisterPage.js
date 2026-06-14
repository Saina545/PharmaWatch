import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    companyName: '',
    companyDomain: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name required';
    if (!formData.companyDomain.trim()) newErrors.companyDomain = 'Company domain required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
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

      <div className="auth-container auth-container-wide">
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
          <div className="auth-card-header">
            <h1>Create account</h1>
            <p>Set up your organization's safety intelligence hub</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {apiError && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#ff3b5c" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11v.5" stroke="#ff3b5c" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {apiError}
              </div>
            )}

            <div className="auth-section-label">Personal Information</div>
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Work Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.smith@company.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Pharmacovigilance Scientist"
                className={errors.jobTitle ? 'error' : ''}
              />
              {errors.jobTitle && <span className="field-error">{errors.jobTitle}</span>}
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="auth-section-label">Organization</div>
            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Pharmaceuticals"
                  className={errors.companyName ? 'error' : ''}
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="companyDomain">Company Domain</label>
                <input
                  type="text"
                  id="companyDomain"
                  name="companyDomain"
                  value={formData.companyDomain}
                  onChange={handleChange}
                  placeholder="acme-pharma.com"
                  className={errors.companyDomain ? 'error' : ''}
                />
                {errors.companyDomain && <span className="field-error">{errors.companyDomain}</span>}
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="spinner" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
