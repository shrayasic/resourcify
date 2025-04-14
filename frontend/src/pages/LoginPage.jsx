// src/pages/LoginPage.jsx
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function LoginPage({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(credentials);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Login to Resourcify</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="input"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-secondary-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

