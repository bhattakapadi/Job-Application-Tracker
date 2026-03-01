import { useState } from 'react';
import axios from 'axios';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'register'
      ? '/api/auth/register'
      : '/api/auth/login';

    const body = mode === 'register'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await axios.post(endpoint, body);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="12" height="12" rx="2" fill="#fff" />
              <rect x="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5" />
              <rect y="16" width="12" height="12" rx="2" fill="#fff" opacity="0.5" />
              <rect x="16" y="16" width="12" height="12" rx="2" fill="#fff" />
            </svg>
          </div>
          <span className="brand-name">JobTracker</span>
        </div>

        <div className="hero-text">
          <h1>Your career,<br />organized.</h1>
          <p>Track every application, interview, and offer — all in one place. Stop losing opportunities to chaos.</p>
        </div>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-num">2.4k</span>
            <span className="stat-label">Jobs Tracked</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">87%</span>
            <span className="stat-label">Response Rate</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">340+</span>
            <span className="stat-label">Offers Received</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Tab bar */}
          <div className="tab-bar">
            <button
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          <div className="card-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{mode === 'login'
              ? 'Sign in to continue tracking your applications.'
              : 'Start managing your job search today.'
            }</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">
                Password
                {mode === 'login' && (
                  <a href="#" className="forgot-link">Forgot password?</a>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <div className="error-banner">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
                  <path d="M8 5v3M8 11h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <span className="spinner" />
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="switch-mode">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className="link-btn" onClick={switchMode}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          font-family: 'DM Sans', sans-serif;
          background: #f8f7f4;
        }

        /* ── Left Panel ── */
        .auth-left {
          width: 46%;
          background: #1a2332;
          padding: 48px 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }

        .brand-icon {
          width: 38px; height: 38px;
          background: rgba(99,179,237,0.15);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .brand-name {
          font-size: 19px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 0 40px;
          z-index: 1;
        }

        .hero-text h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 3.5vw, 52px);
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }

        .hero-text p {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          max-width: 320px;
          font-weight: 300;
        }

        .stats-row {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 28px 0 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          z-index: 1;
        }

        .stat { display: flex; flex-direction: column; gap: 2px; }
        .stat-num { font-size: 24px; font-weight: 600; color: #fff; letter-spacing: -0.5px; }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.6px; }
        .stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }

        /* ── Right Panel ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: #f8f7f4;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 20px;
          padding: 36px 40px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08);
        }

        .tab-bar {
          display: flex;
          background: #f1f0ed;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .tab {
          flex: 1;
          padding: 9px;
          border: none;
          background: transparent;
          border-radius: 7px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          color: #888;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .tab.active {
          background: #fff;
          color: #1a2332;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .card-header { margin-bottom: 24px; }

        .card-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: #1a2332;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
        }

        .card-header p { font-size: 13px; color: #888; line-height: 1.5; }

        .auth-form { display: flex; flex-direction: column; gap: 18px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .field label {
          font-size: 13px;
          font-weight: 500;
          color: #3d4a5c;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link { font-size: 12px; color: #4a7cdc; text-decoration: none; font-weight: 400; }
        .forgot-link:hover { text-decoration: underline; }

        .field input {
          padding: 11px 14px;
          border: 1.5px solid #e8e6e1;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1a2332;
          background: #fafaf8;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field input::placeholder { color: #bbb; }

        .field input:focus {
          border-color: #4a7cdc;
          box-shadow: 0 0 0 3px rgba(74,124,220,0.1);
          background: #fff;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
        }

        .submit-btn {
          padding: 13px;
          background: #1a2332;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          margin-top: 4px;
        }

        .submit-btn:hover:not(:disabled) { background: #253347; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .switch-mode {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #888;
        }

        .link-btn {
          background: none;
          border: none;
          color: #4a7cdc;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }

        .link-btn:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { background: #f8f7f4; padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
}