// SAMPLE App.js showing how to mount the admin pages alongside your existing routes.
// If you don't want to overwrite your App.js, copy just the relevant parts.
//
// Requirements: react-router-dom v6+
// npm i react-router-dom

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Your existing pages (adjust imports to match your project)
import Home from "./Home";
import Explore from "./Explore";
import MyTrips from "./MyTrips";
import Plan from "./Plan";
import Profile from "./Profile";
import Header from "./Header";

// Admin pages
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminPlaces from "./AdminPlaces";
import AddPlace from "./AddPlace";

export default function App() {
  return (
    <Router>
      <Header />

      {/* Admin quick nav (optional) */}
      <div className="admin-nav">
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/posts">User Posts</Link>
        <Link to="/admin/places">View Places</Link>
        <Link to="/admin/add">Add Place</Link>
      </div>

      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/mytrips" element={<MyTrips />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin routes */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/places" element={<AdminPlaces />} />
        <Route path="/admin/add" element={<AddPlace />} />
      </Routes>
    </Router>
  );
}
