import React, { useState } from "react";
import "./AddPlace.css";

export default function AddPlace() {
  const [form, setForm] = useState({
    category: "Attraction",
    name: "",
    description: "",
    image: "",
    location_lat: "",
    location_lng: "",
    location_address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert lat/lng to float
    const payload = {
      ...form,
      location_lat: parseFloat(form.location_lat),
      location_lng: parseFloat(form.location_lng),
    };
    fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Place added successfully!");
        setForm({
          category: "Attraction",
          name: "",
          description: "",
          image: "",
          location_lat: "",
          location_lng: "",
          location_address: "",
        });
      })
      .catch((err) => console.error("Error adding place:", err));
  };

  return (
    <div className="add-place-container">
      <h2 className="form-title">Admin &middot; Add Attraction/Restaurant</h2>
      <form onSubmit={handleSubmit} className="card add-place-form">
        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Attraction">Attraction</option>
            <option value="Restaurant">Restaurant</option>
          </select>
        </div>
        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., City Museum"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Latitude</label>
          <input
            name="location_lat"
            value={form.location_lat}
            onChange={handleChange}
            placeholder="e.g., 41.8781"
            required
            className="form-input"
            type="number"
            step="any"
          />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input
            name="location_lng"
            value={form.location_lng}
            onChange={handleChange}
            placeholder="e.g., -87.6298"
            required
            className="form-input"
            type="number"
            step="any"
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            name="location_address"
            value={form.location_address}
            onChange={handleChange}
            placeholder="e.g., 123 Main St"
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Place
        </button>
      </form>
    </div>
  );
}
