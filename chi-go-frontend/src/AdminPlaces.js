import React, { useState, useEffect, useMemo } from "react";

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]); // Stores filtered results

  // Fetch places from backend API
  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        setPlaces(data);
        setFilteredPlaces(data); // Initialize filteredPlaces with all places
      })
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  // Filter places based on query
  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredPlaces(places); // Show all places if query is empty
    } else {
      setFilteredPlaces(
        places.filter((p) =>
          [p.type, p.name, p.address, p.code].some((f) =>
            f.toLowerCase().includes(q)
          )
        )
      );
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const attractions = useMemo(
    () => filteredPlaces.filter((p) => p.type === "Attraction"),
    [filteredPlaces]
  );
  const restaurants = useMemo(
    () => filteredPlaces.filter((p) => p.type === "Restaurant"),
    [filteredPlaces]
  );

  // Delete a place via backend API
  const deletePlace = (id) => {
    fetch(`/api/places/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        setFilteredPlaces((prev) => prev.filter((p) => p.id !== id)); // Update filteredPlaces
      })
      .catch((err) => console.error("Error deleting place:", err));
  };

  return (
    <div className="container">
      <h2>Admin · All Attractions/Restaurants</h2>
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem", display: "flex", alignItems: "center" }}>
        <input
          placeholder="Search by type/name/address/code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress} // Trigger search on Enter key press
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
          {attractions.map((place) => (
            <li key={place.id} className="list-row">
              <div>
                <strong>{place.type}</strong> — {place.name}
                <div className="muted">
                  {place.address} · {place.code}
                </div>
              </div>
              <button className="danger" onClick={() => deletePlace(place.id)}>
                Delete
              </button>
            </li>
          ))}
          {attractions.length === 0 && <li className="muted">No results</li>}
        </ul>
      </div>

      {/* Restaurants Box */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Restaurants</h3>
        <ul className="list">
          {restaurants.map((place) => (
            <li key={place.id} className="list-row">
              <div>
                <strong>{place.type}</strong> — {place.name}
                <div className="muted">
                  {place.address} · {place.code}
                </div>
              </div>
              <button className="danger" onClick={() => deletePlace(place.id)}>
                Delete
              </button>
            </li>
          ))}
          {restaurants.length === 0 && <li className="muted">No results</li>}
        </ul>
      </div>
    </div>
  );
}
