import React, { useState } from 'react';
import '../Login.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 좌측 - 대형 타이포그래피 */}
      <div className="login-hero">
        <h1 className="hero-title">
          <span>HUMAN</span>
          <span className="accent">RESOURCE</span>
          <span>AI</span>
        </h1>
        <p className="hero-subtitle">Intelligence Management System</p>
        <div className="deco-number">25</div>
      </div>

      {/* 우측 - 로그인 폼 */}
      <div className="login-form-section">
        <img src="/logo.png" alt="KCS" className="form-logo" />
        
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-description">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">{error}</div>
            )}

            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                type="text"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID"
                autoFocus
              />
              <div className="input-line"></div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <div className="input-line"></div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Continue'}</span>
            </button>
          </form>

          <div className="login-footer">
            <p>© 2025 KCS Corporation. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
