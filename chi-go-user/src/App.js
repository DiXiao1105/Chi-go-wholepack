import React, { useState } from 'react';
import './App.css';
import { AuthProvider } from './components/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Attractions from './pages/Attractions';
import Restaurants from './pages/Restaurants';
import MyChecklist from './pages/MyChecklist';
import Community from './pages/Community';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'attractions':
        return <Attractions />;
      case 'restaurants':
        return <Restaurants />;
      case 'checklist':
        return <MyChecklist />;
      case 'community':
        return <Community />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main>
          {renderPage()}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
