import React, { useState, useEffect } from "react";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [groupedPosts, setGroupedPosts] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [places, setPlaces] = useState([]);

  // Fetch posts from backend API
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        groupPostsByUser(data); // Group posts by user
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  // Fetch places for dropdown options
  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  // Group posts by user
  const groupPostsByUser = (posts) => {
    const grouped = posts.reduce((acc, post) => {
      const userName = post.user_name;
      if (!acc[userName]) {
        acc[userName] = [];
      }
      acc[userName].push(post);
      return acc;
    }, {});
    setGroupedPosts(grouped);
  };

  // Handle editing change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPost((prev) => ({ ...prev, [name]: value }));
  };

  // Save edit by calling PUT endpoint
  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/posts/${editingPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: editingPost.place_id,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        const updatedPosts = posts.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                place_name: places.find((pl) => pl.id === parseInt(editingPost.place_id)).name,
                place_type: places.find((pl) => pl.id === parseInt(editingPost.place_id)).type,
              }
            : p
        );
        setPosts(updatedPosts);
        groupPostsByUser(updatedPosts); // Regroup posts after update
        setEditingPost(null);
      })
      .catch((err) => console.error("Error updating post:", err));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPost(null);
  };

  // Delete a post
  const deletePost = (postId) => {
    fetch(`/api/posts/${postId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        const updatedPosts = posts.filter((p) => p.id !== postId);
        setPosts(updatedPosts);
        groupPostsByUser(updatedPosts); // Regroup posts after deletion
      })
      .catch((err) => console.error("Error deleting post:", err));
  };

  return (
    <div className="container">
      <h2>Admin · User Posts</h2>
      {Object.keys(groupedPosts).length === 0 ? (
        <p>No posts found.</p>
      ) : (
        Object.entries(groupedPosts).map(([userName, userPosts]) => (
          <div key={userName} className="user-group">
            <h3>User: {userName}</h3>
            <ul className="list">
              {userPosts.map((post) => (
                <li key={post.id} className="list-row">
                  {editingPost && editingPost.id === post.id ? (
                    <form onSubmit={saveEdit} className="edit-form">
                      <select
                        name="place_id"
                        value={editingPost.place_id}
                        onChange={handleEditChange}
                      >
                        {places.map((place) => (
                          <option key={place.id} value={place.id}>
                            {place.name} ({place.type})
                          </option>
                        ))}
                      </select>
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <div>
                        <strong>Place:</strong> {post.place_name} ({post.place_type})
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
        ))
      )}
    </div>
  );
}
