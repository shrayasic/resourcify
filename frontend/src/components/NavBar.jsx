// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ isAuthenticated, onLogout }) {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-[#4A4A4A] tracking-wide hover:text-[#0D87F2] transition"
          >
            🌟 Resourcify
          </Link>

          <div className="flex items-center space-x-4 text-[16px] font-medium">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-500 transition px-3 py-1 rounded-md"
                >
                  Topics
                </Link>
                <button
                  onClick={onLogout}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1.5 rounded-full transition shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-500 transition px-3 py-1 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-1.5 rounded-full transition shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
