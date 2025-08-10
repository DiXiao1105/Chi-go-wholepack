import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js

export default function AdminAnalytics() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [rankings, setRankings] = useState({ attractions: [], restaurants: [] });

  // Fetch total users from backend
  useEffect(() => {
    fetch("/api/users/count")
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.count))
      .catch((err) => console.error("Error fetching total users:", err));
  }, []);

  // Fetch rankings from backend
  useEffect(() => {
    fetch("/api/places/rankings")
      .then((res) => res.json())
      .then((data) => setRankings(data))
      .catch((err) => console.error("Error fetching rankings:", err));
  }, []);

  // Prepare data for bar charts
  const attractionData = {
    labels: rankings.attractions.map((a) => a.name),
    datasets: [
      {
        label: "Number of Users",
        data: rankings.attractions.map((a) => a.userCount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const restaurantData = {
    labels: rankings.restaurants.map((r) => r.name),
    datasets: [
      {
        label: "Number of Users",
        data: rankings.restaurants.map((r) => r.userCount),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="container">
      <h2>Admin · Analytics</h2>

      {/* Total Users */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>Total Users</h3>
        <p>{totalUsers}</p>
      </div>

      {/* Rankings */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>Top Attractions</h3>
        <ul>
          {rankings.attractions.map((a, index) => (
            <li key={index}>
              {index + 1}. {a.name} - Users: {a.userCount}
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>Top Restaurants</h3>
        <ul>
          {rankings.restaurants.map((r, index) => (
            <li key={index}>
              {index + 1}. {r.name} - Users: {r.userCount}
            </li>
          ))}
        </ul>
      </div>

      {/* Graphs */}
      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>Attractions Popularity</h3>
        <Bar data={attractionData} />
      </div>

      <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <h3>Restaurants Popularity</h3>
        <Bar data={restaurantData} />
      </div>
    </div>
  );
}