import React, { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users from backend API
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Handle editing change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save edit by calling PUT endpoint
  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser),
    })
      .then((res) => res.json())
      .then((data) => {
        // Update local state with updated user from response
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? data.user : u))
        );
        setEditingUser(null);
      })
      .catch((err) => console.error("Error updating user:", err));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingUser(null);
  };

  // Delete a user via backend API
  const deleteUser = (userId) => {
    fetch(`/api/users/${userId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  return (
    <div className="container">
      <h2>Admin · Manage Users</h2>
      <ul className="list">
        {users.map((u) => (
          <li key={u.id} className="list-row">
            {editingUser && editingUser.id === u.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <input
                  name="name"
                  value={editingUser.name}
                  onChange={handleEditChange}
                  placeholder="Name"
                />
                <input
                  name="email"
                  value={editingUser.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                />
                <button type="submit">Save</button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div>
                  <strong>{u.name}</strong>
                  <div className="muted">{u.email}</div>
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
