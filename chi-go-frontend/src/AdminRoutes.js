// Optional helper to avoid overwriting your App.js.
// Import AdminNav/AdminRoutes into your existing App.js where you render <Header />
// Example:
//   import { AdminNav, AdminRoutes } from "./AdminRoutes";
//   ...inside Router:
//   <AdminNav />   // shows the admin links
//   <Routes>
//     ...your existing routes
//     <AdminRoutes />   // injects admin routes
//   </Routes>

import React from "react";
import { Link, Route } from "react-router-dom";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminPlaces from "./AdminPlaces";
import AddPlace from "./AddPlace";

export function AdminNav() {
  return (
    <nav className="admin-nav">
      <Link to="/admin/users">Manage Users</Link>
      <Link to="/admin/posts">User Posts</Link>
      <Link to="/admin/places">View Places</Link>
      <Link to="/admin/add">Add Place</Link>
    </nav>
  );
}

export function AdminRoutes() {
  return (
    <>
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/posts" element={<AdminPosts />} />
      <Route path="/admin/places" element={<AdminPlaces />} />
      <Route path="/admin/add" element={<AddPlace />} />
    </>
  );
}
