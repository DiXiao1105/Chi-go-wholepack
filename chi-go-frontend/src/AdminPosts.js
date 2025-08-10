import React, { useState, useEffect } from "react";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");

  // Fetch posts from backend API
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  // Delete a post using its id via backend API
  const deletePost = (postId) => {
    fetch(`/api/posts/${postId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      })
      .catch((err) => console.error("Error deleting post:", err));
  };

  // Filter posts by user name (assuming your post object contains a "user" field)
  const filteredPosts = posts.filter((p) =>
    (p.user ? p.user.toLowerCase() : "").includes(query.trim().toLowerCase())
  );

  return (
    <div className="container">
      <h2>Admin · User Posts</h2>
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <input
          type="text"
          placeholder="Search posts by user..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
        />
      </div>
      
      {filteredPosts.length > 0 ? (
        filteredPosts.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{ marginBottom: "1rem", padding: "1rem", position: "relative" }}
          >
            <h3>{p.user || "Unknown User"}</h3>
            <p>{p.content || "No content"}</p>
            <button
              className="danger"
              onClick={() => deletePost(p.id)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#d52349",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="muted">No posts found</p>
      )}
    </div>
  );
}
