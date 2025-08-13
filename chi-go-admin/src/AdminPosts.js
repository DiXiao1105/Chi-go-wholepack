
import React, { useState, useEffect } from "react";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  // Fetch all posts from backend API
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  // Handle input changes for editing
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPost((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save edited post
  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/posts/${editingPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingPost.title,
        description: editingPost.description,
        is_public: editingPost.is_public
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        setEditingPost(null);
      })
      .catch((err) => console.error("Error updating post:", err));
  };

  // Cancel editing
  const cancelEdit = () => setEditingPost(null);

  // Delete a post
  const deletePost = (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    fetch(`/api/posts/${postId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      })
      .catch((err) => console.error("Error deleting post:", err));
  };

  return (
    <div className="container">
      <h2>Admin · All Posts</h2>
      <ul className="list">
        {posts.length === 0 && <li className="muted">No posts found.</li>}
        {posts.map((post) => (
          <li key={post.id} className="list-row">
            {editingPost && editingPost.id === post.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <input
                  name="title"
                  value={editingPost.title}
                  onChange={handleEditChange}
                  placeholder="Title"
                  required
                />
                <input
                  name="description"
                  value={editingPost.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                  required
                />
                {/* Public field removed as it should not be editable */}
                <button type="submit">Save</button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div>
                  <strong>Title:</strong> {post.title}<br />
                  <strong>Description:</strong> {post.description}<br />
                  <strong>User ID:</strong> {post.user_id}<br />
                  <strong>Checklist:</strong>
                  <ul style={{ margin: '0 0 0 1em', padding: 0 }}>
                    {Array.isArray(post.checklist) && post.checklist.length > 0 ? (
                      post.checklist.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <span style={{color:'#888'}}>({item.itemType})</span>
                        </li>
                      ))
                    ) : (
                      <li style={{color:'#888'}}>No items</li>
                    )}
                  </ul>
                  <strong>Public:</strong> {post.is_public ? "Yes" : "No"}<br />
                  <strong>Created:</strong> {post.created_at}<br />
                  <strong>Updated:</strong> {post.updated_at}
                </div>
                <div className="actions">
                  <button onClick={() => setEditingPost(post)}>Edit</button>
                  <button className="danger" onClick={() => deletePost(post.id)}>
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
