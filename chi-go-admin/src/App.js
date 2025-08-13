
import logo from './logo.svg';
import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminPlaces from "./AdminPlaces";
import AddPlace from "./AddPlace";
import Login from "./Login";
import AdminAnalytics from "./AdminAnalytics";
import "./admin.min.css";
import "./admin-custom.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  function AppRoutes({ isLoggedIn, setIsLoggedIn, username, setUsername }) {
    const location = useLocation();
    return (
      <>
        {location.pathname !== "/login" && location.pathname !== "/" && (
          <div className="header">
            <div className="logo-title" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", justifyContent: "center" }}>
              <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#fff" }}>Chi-go Admin</h1>
            </div>
            <div className="admin-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                Manage Users
              </NavLink>
              <NavLink 
                to="/admin/posts" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                User Posts
              </NavLink>
              <NavLink 
                to="/admin/places" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                View Places
              </NavLink>
              <NavLink 
                to="/admin/add" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                Add Place
              </NavLink>
              <NavLink 
                to="/admin/analytics" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                Analytics
              </NavLink>
              {/* Login/Logout logic */}
              {!isLoggedIn ? (
                <NavLink to="/login" className="nav-item">
                  Login
                </NavLink>
              ) : (
                <>
                  <span style={{ color: '#fff', fontWeight: 500 }}>Hello, {username || 'Admin'}</span>
                  <button
                    className="nav-item"
                    style={{ background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => {
                      setIsLoggedIn(false);
                      setUsername("");
                      window.location.href = "/login";
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="content">
          <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/places" element={<AdminPlaces />} />
            <Route path="/admin/add" element={<AddPlace />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/user" element={<div style={{ padding: "2rem", textAlign: "center" }}><h2>User Page Placeholder</h2></div>} />
            <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
          </Routes>
        </div>
      </>
    );
  }

  return (
    <Router>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        setUsername={setUsername}
      />
    </Router>
  );
}

export default App;
