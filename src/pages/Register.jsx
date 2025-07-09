import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiCurrentLocation } from "react-icons/bi";
import {
  FcElectronics,
  FcShop,
  FcHome,
  FcAutomotive,
  FcMindMap,
  FcCloth,
  FcManager,
  FcConferenceCall,
} from "react-icons/fc";

const categories = [
  { label: "Electronics", icon: <FcElectronics size={28} /> },
  { label: "Groceries", icon: <FcShop size={28} /> },
  { label: "Household", icon: <FcHome size={28} /> },
  { label: "Vehicle Care", icon: <FcAutomotive size={28} /> },
  { label: "Body Care & Diet", icon: <FcMindMap size={28} /> },
  {
    label: "Clothing, Handbags, Watches & Accessories",
    icon: <FcCloth size={28} />,
  },
  { label: "Pets", icon: <FcManager size={28} /> },
  { label: "School Utensils", icon: <FcConferenceCall size={28} /> },
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email = "", password = "" } = location.state || {};

  const [user, setUser] = useState({
    name: "",
    email: email,
    password: password,
    age: "",
    gender: "",
    location: "",
    fav_category: [], // allow multiple selection
  });

  function toggleCategory(category) {
    setUser((prev) => {
      const isSelected = prev.fav_category.includes(category);
      const newCategories = isSelected
        ? prev.fav_category.filter((c) => c !== category)
        : [...prev.fav_category, category];
      return { ...prev, fav_category: newCategories };
    });
  }

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const { city, town, state, country } = response.data.address;
          const place = city || town || state || "Unknown";
          setUser((prev) => ({
            ...prev,
            location: `${place}, ${country}`,
          }));
        } catch (err) {
          console.error("Error fetching location info", err);
          alert("Could not detect location");
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        alert("Location permission denied.");
      }
    );
  };

  async function handleRegist(e) {
    e.preventDefault();

    // Check if at least one category is selected
    if (user.fav_category.length === 0) {
      alert("Please select at least one favorite category.");
      return;
    }

    try {
      const payload = {
        ...user,
        fav_category: user.fav_category.join(","), // convert to string if needed
      };

      const response = await axios.post(
        "http://localhost:3000/register",
        payload
      );

      if (response.status === 200) {
        alert("Account successfully created!");
        navigate("/");
      }
    } catch (error) {
      if (error?.response?.data?.error === "User Exists") {
        alert("User Already Exists, Please Login");
        navigate("/");
      } else {
        alert("Something went wrong. Please try again.");
        console.error(error);
      }
    }
  }

  return (
    <div className="login-container" style={{ marginTop: "350px" }}>
      <h2 className="login-heading">
        Create your <span className="highlight">Walmart</span> account
      </h2>

      <form onSubmit={handleRegist}>
        <div className="form-container">
          <label className="label">Name</label>
          <input
            name="name"
            type="text"
            className="input"
            value={user.name}
            onChange={handleChange}
            required
          />

          <label className="label">Mail-ID</label>
          <input
            type="email"
            name="email"
            className="input"
            value={user.email}
            onChange={handleChange}
            required
          />

          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            className="input"
            value={user.password}
            onChange={handleChange}
            required
          />

          <label className="label">Age</label>
          <input
            type="number"
            name="age"
            className="input"
            value={user.age}
            onChange={handleChange}
            required
          />

          <label className="label">Gender</label>
          <select
            name="gender"
            className="input"
            value={user.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label className="label">Location</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="text"
              name="location"
              className="input"
              style={{ flex: 1 }}
              value={user.location}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={detectLocation}
              style={{
                backgroundColor: "#799be3",
                color: "white",
                borderRadius: "3px",
                border: "none",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                marginBottom: "20px",
              }}
            >
              <BiCurrentLocation size={18} />
            </button>
          </div>

          <label className="label">Select Favorite Categories</label>
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {categories.map(({ label, icon }) => {
              const isSelected = user.fav_category.includes(label);
              return (
                <div
                  key={label}
                  onClick={() => toggleCategory(label)}
                  style={{
                    position: "relative",
                    border: isSelected ? "2px solid #155fff" : "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e6f0ff" : "#fff",
                    boxShadow: isSelected
                      ? "0 0 5px rgba(21, 95, 255, 0.5)"
                      : "none",
                  }}
                >
                  <div>{icon}</div>
                  <span style={{ fontSize: "14px" }}>{label}</span>

                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "16px",
                        height: "16px",
                        backgroundColor: "#155fff",
                        color: "white",
                        fontSize: "12px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="submit-button"
            style={{ margin: "30px 0 " }}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}
