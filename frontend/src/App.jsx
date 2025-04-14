// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import TopicsPage from './pages/TopicsPage';
import SubtopicsPage from './pages/SubtopicsPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { authService } from './services/api';

function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    // Update auth status when localStorage changes
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#e8fae4f1]">
        <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="container mx-auto px-0 py-0">
          <Routes>
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
              <PrivateRoute>
                <TopicsPage />
              </PrivateRoute>
            } />
            <Route path="/topics/:topicId" element={
              <PrivateRoute>
                <SubtopicsPage />
              </PrivateRoute>
            } />
            <Route path="/subtopics/:subtopicId" element={
              <PrivateRoute>
                <ResourcesPage />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;