import logo from './logo.svg';
import './App.css';

// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminPlaces from "./AdminPlaces";
import AddPlace from "./AddPlace";
import Login from "./Login";
import AdminAnalytics from "./AdminAnalytics"; // Import the new page

import "./admin.min.css";
import "./admin-custom.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  return (
    <Router>
      {isLoggedIn && (
        <div className="header">
          <div className="logo-title" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", justifyContent: "center" }}>
            <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#fff" }}>Chi-go Admin</h1>
          </div>
          <div className="admin-nav">
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
          </div>
        </div>
      )}

      <div className="content">
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/places" element={<AdminPlaces />} />
          <Route path="/admin/add" element={<AddPlace />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/user" element={<div style={{ padding: "2rem", textAlign: "center" }}><h2>User Page Placeholder</h2></div>} />
          <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

