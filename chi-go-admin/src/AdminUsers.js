import React, { useState, useEffect } from "react";


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch all users from backend API
  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes for editing
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save edited user
  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser),
    })
      .then((res) => res.json())
      .then(() => {
        setEditingUser(null);
        fetchUsers();
      })
      .catch((err) => console.error("Error updating user:", err));
  };

  // Cancel editing
  const cancelEdit = () => setEditingUser(null);

  // Delete a user
  const deleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    fetch(`/api/users/${userId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        fetchUsers();
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  return (
    <div className="container">
      <h2>Admin · Manage Users</h2>
      <ul className="list">
        {users.length === 0 && <li className="muted">No users found.</li>}
        {users.map((u) => (
          <li key={u.id} className="list-row">
            {editingUser && editingUser.id === u.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <input
                  name="username"
                  value={editingUser.username}
                  onChange={handleEditChange}
                  placeholder="Username"
                  required
                />
                <input
                  name="email"
                  value={editingUser.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  required
                />
                <input
                  name="avatar"
                  value={editingUser.avatar || ""}
                  onChange={handleEditChange}
                  placeholder="Avatar URL"
                />
                <select
                  name="role"
                  value={editingUser.role}
                  onChange={handleEditChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label>
                  Active:
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={!!editingUser.is_active}
                    onChange={handleEditChange}
                  />
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div>
                  <strong>{u.username}</strong> <span className="muted">({u.role})</span><br />
                  <span>Email: {u.email}</span><br />
                  {u.avatar && <span>Avatar: <a href={u.avatar} target="_blank" rel="noopener noreferrer">View</a></span>}<br />
                  <span>Active: {u.is_active ? "Yes" : "No"}</span><br />
                  <span>Created: {u.created_at}</span><br />
                  <span>Updated: {u.updated_at}</span>
                </div>
                <div className="actions">
                  <button onClick={() => setEditingUser(u)}>Edit</button>
                  <button className="danger" onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
