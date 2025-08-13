
import React, { useState, useEffect, useMemo } from "react";

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [editingPlace, setEditingPlace] = useState(null);

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data);
        setFilteredPlaces(data);
      })
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(
        places.filter((p) =>
          [p.category, p.name, p.location_address, p.description].some((f) =>
            f && f.toLowerCase().includes(q)
          )
        )
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPlace((prev) => ({
      ...prev,
      [name]:
        name === "is_active"
          ? (type === "checkbox" ? checked : value === "true")
          : (type === "checkbox" ? checked : value),
    }));
  };

  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`/api/places/${editingPlace.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPlace),
    })
      .then((res) => res.json())
      .then((data) => {
        setEditingPlace(null);
        // Auto-refresh: re-fetch places from backend
        fetch("/api/places")
          .then((res) => res.json())
          .then((data) => {
            setPlaces(data);
            setFilteredPlaces(data);
          });
      })
      .catch((err) => console.error("Error updating place:", err));
  };

  const cancelEdit = () => setEditingPlace(null);

  const deletePlace = (id) => {
    fetch(`/api/places/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        setFilteredPlaces((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((err) => console.error("Error deleting place:", err));
  };

  const attractions = useMemo(
    () => filteredPlaces.filter((p) => p.category === "Attraction"),
    [filteredPlaces]
  );
  const restaurants = useMemo(
    () => filteredPlaces.filter((p) => p.category === "Restaurant"),
    [filteredPlaces]
  );

  const renderPlaceRow = (place) => (
    <li key={place.id} className="list-row">
      {editingPlace && editingPlace.id === place.id ? (
        <form onSubmit={saveEdit} className="edit-form">
          <input name="name" value={editingPlace.name} onChange={handleEditChange} placeholder="Name" required />
          <input name="description" value={editingPlace.description} onChange={handleEditChange} placeholder="Description" />
          <input name="location_address" value={editingPlace.location_address} onChange={handleEditChange} placeholder="Address" />
          <input name="location_lat" value={editingPlace.location_lat} onChange={handleEditChange} placeholder="Latitude" />
          <input name="location_lng" value={editingPlace.location_lng} onChange={handleEditChange} placeholder="Longitude" />
          <input name="image" value={editingPlace.image || ''} onChange={handleEditChange} placeholder="Image URL" />
          {/* Active field removed as requested */}
          <button type="submit">Save</button>
                  <td>
                    {place.image ? (
                      <a href={place.image} target="_blank" rel="noopener noreferrer">{place.image}</a>
                    ) : (
                      <span style={{color: 'gray'}}>No image</span>
                    )}
                  </td>
        </form>
      ) : (
        <>
          <div>
            <strong>{place.category}</strong> — {place.name}
            <div className="muted">
              <span>Description: {place.description}</span><br />
              <span>Address: {place.location_address}</span><br />
              <span>Lat/Lng: {place.location_lat}, {place.location_lng}</span><br />
              {place.image && <span>Image: <a href={place.image} target="_blank" rel="noopener noreferrer">View</a></span>}<br />
              <span>Active: {place.is_active ? "Yes" : "No"}</span><br />
              <span>Created: {place.created_at}</span><br />
              <span>Updated: {place.updated_at}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => setEditingPlace(place)}>Edit</button>
            <button className="danger" onClick={() => deletePlace(place.id)}>Delete</button>
          </div>
        </>
      )}
    </li>
  );

  return (
    <div className="container">
      <h2>Admin · All Attractions/Restaurants</h2>
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem", display: "flex", alignItems: "center" }}>
        <input
          placeholder="Search by type/name/address/code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: "80%", padding: "0.5rem", boxSizing: "border-box" }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "0.5rem",
            padding: "0.3rem 0.6rem",
            backgroundColor: "#d52349",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Search
        </button>
      </div>

      {/* Attractions Box */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Attractions</h3>
        <ul className="list">
          {attractions.map(renderPlaceRow)}
          {attractions.length === 0 && <li className="muted">No results</li>}
        </ul>
      </div>

      {/* Restaurants Box */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Restaurants</h3>
        <ul className="list">
          {restaurants.map(renderPlaceRow)}
          {restaurants.length === 0 && <li className="muted">No results</li>}
        </ul>
      </div>
    </div>
  );

}