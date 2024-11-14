import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [protectedData, setProtectedData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/status');
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      setError('Failed to check auth status');
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${axios.defaults.baseURL}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
      setProtectedData(null);
      setError(null);
    } catch (err) {
      setError('Logout failed');
      console.error('Logout failed:', err);
    }
  };

  const fetchProtectedData = async () => {
    try {
      const response = await axios.get('/api/protected');
      setProtectedData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch protected data');
      if (err.response?.status === 401) {
        setUser(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="auth-container">
        <h1>Google OAuth Demo</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {user ? (
          <div className="user-container">
            <div className="user-info">
              <p className="welcome-text">Welcome, {user.displayName}!</p>
              <p className="user-email">{user.emails?.[0]?.value}</p>
            </div>

            <div className="button-container">
              <button
                onClick={fetchProtectedData}
                className="fetch-button"
              >
                Fetch Protected Data
              </button>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>

            {protectedData && (
              <div className="protected-data">
                <pre>
                  {JSON.stringify(protectedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="login-button"
          >
            <span className="google-icon">G</span>
            Login with Google
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
