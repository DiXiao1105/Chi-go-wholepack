import React, { useState } from "react";
import "./AddPlace.css";

export default function AddPlace() {
  const [form, setForm] = useState({
    type: "Attraction",
    name: "",
    address: "",
    code: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Place added successfully!");
        setForm({ type: "Attraction", name: "", address: "", code: "" });
      })
      .catch((err) => console.error("Error adding place:", err));
  };

  return (
    <div className="add-place-container">
      <h2 className="form-title">Admin &middot; Add Attraction/Restaurant</h2>
      <form onSubmit={handleSubmit} className="card add-place-form">
        <div className="form-group">
          <label>Type</label>
          <select
            name="type"
            value={form.type}
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
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g., 123 Main St"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Google Place ID</label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="e.g., AT123"
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
