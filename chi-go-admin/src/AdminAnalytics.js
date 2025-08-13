
// AdminAnalytics: Dashboard for admin analytics
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function AdminAnalytics() {
  // State for analytics data
  const [totalUsers, setTotalUsers] = useState(0);
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch analytics data from backend
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");
        // Fetch total users
        const userRes = await fetch("/api/users/count");
        const userData = await userRes.json();
        setTotalUsers(userData.count || 0);

        // Fetch rankings
        const rankRes = await fetch("/api/places/rankings");
        const rankData = await rankRes.json();
        setAttractions(rankData.attractions || []);
        setRestaurants(rankData.restaurants || []);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Prepare chart data
  const attractionData = {
    labels: attractions.map((a) => a.name),
    datasets: [
      {
        label: "Users",
        data: attractions.map((a) => a.userCount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };
  const restaurantData = {
    labels: restaurants.map((r) => r.name),
    datasets: [
      {
        label: "Users",
        data: restaurants.map((r) => r.userCount),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Chart options: y-axis only shows integer ticks
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) return value;
          }
        }
      }
    }
  };

  return (
    <div className="container">
      <h2>Admin · Analytics</h2>
      {loading ? (
        <div>Loading analytics...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <>
          {/* Total Users */}
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>

          {/* Top Attractions */}
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <h3>Top Attractions</h3>
            <ul>
              {attractions.map((a, idx) => (
                <li key={idx}>
                  {idx + 1}. {a.name} — Users: {a.userCount}
                </li>
              ))}
            </ul>
          </div>

          {/* Top Restaurants */}
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <h3>Top Restaurants</h3>
            <ul>
              {restaurants.map((r, idx) => (
                <li key={idx}>
                  {idx + 1}. {r.name} — Users: {r.userCount}
                </li>
              ))}
            </ul>
          </div>

          {/* Charts */}
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <h3>Attractions Popularity</h3>
            <Bar data={attractionData} options={chartOptions} />
          </div>
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <h3>Restaurants Popularity</h3>
            <Bar data={restaurantData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}