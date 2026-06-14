import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import WatchlistPage from './pages/WatchlistPage'; // Added import
import PlaceholderPage from './pages/PlaceholderPage';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPasswordPage /></PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute><ResetPasswordPage /></PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          
          {/* Replaced PlaceholderPage with WatchlistPage */}
          <Route path="/watchlist" element={
            <ProtectedRoute><WatchlistPage /></ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <PlaceholderPage title="Analytics" description="Deep-dive signal trends, time-series graphs, and comparative analysis." />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <PlaceholderPage title="Settings" description="Configure alerts, notifications, API keys, and team access." />
            </ProtectedRoute>
          } />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}