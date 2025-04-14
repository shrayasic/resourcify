import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function RegisterPage() {
  const [userData, setUserData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '', 
    gmail: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      await authService.register({ 
        username: userData.username, 
        password: userData.password,
        gmail: userData.gmail
      });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
        
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
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="gmail" className="block text-sm font-medium text-secondary-700 mb-1">
              Gmail
            </label>
            <input
              type="email"
              id="gmail"
              name="gmail"
              className="input"
              value={userData.gmail}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={userData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              value={userData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-secondary-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
