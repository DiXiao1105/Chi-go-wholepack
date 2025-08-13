import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

const Header = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors" 
              onClick={() => setCurrentPage('home')}
            >
              Chi-Go
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['home', 'attractions', 'restaurants', 'community', 'checklist'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                  currentPage === page 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600 border-transparent hover:border-gray-300'
                }`}
              >
                {page === 'checklist' ? 'My Checklist' : page}
              </button>
            ))}
            {user && user.role === 'admin' && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                  currentPage === 'admin' 
                    ? 'text-red-600 border-red-600' 
                    : 'text-red-700 hover:text-red-600 border-transparent hover:border-red-300'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Hello, {user.username}
                  </span>
                  {user.role === 'admin' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"
              >
                <User size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;