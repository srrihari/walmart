import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth";
import { IoMdLogOut } from "react-icons/io";
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

export default function Profile() {
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setBudget(user.budget || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await axios.put("http://localhost:3000/user/budget", {
        id: user.id,
        budget: parseFloat(budget),
      });

      if (response.status === 200) {
        const updatedUser = { ...user, budget };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setMessage("✅ Budget updated successfully!");
      }
    } catch (error) {
      setMessage("❌ Failed to update budget.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    alert("Logged out Successfully");
    navigate("/");
  };

  if (!user) return <p className="profile-loading">Loading...</p>;

  const favoriteCategories = categories.filter(({ label }) =>
    user.fav_category?.includes(label)
  );

  console.log(favoriteCategories);

  return (
    <div className="profile-container" style={{ marginTop: "100px" }}>
      <div className="profile-card">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "20px",
            marginBottom: "10px",
          }}
        >
          <button
            style={{
              border: "none",
              backgroundColor: "orange",
              color: "white",
              borderRadius: "20px",
              padding: "6px 14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/orders`)}
          >
            Your Orders
          </button>
        </div>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Age:</strong> {user.age}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender}
        </p>
        <p>
          <strong>Location:</strong> {user.location}
        </p>

        <p>
          <strong>Favorite Categories:</strong>
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {favoriteCategories.map(({ label, icon }) => (
            <div
              key={label}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "12px",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
                width: "130px",
              }}
            >
              <div>{icon}</div>
              <span style={{ fontSize: "14px" }}>{label}</span>
            </div>
          ))}
        </div>

        <label className="profile-label">Budget:</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="number"
            className="profile-input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter your budget"
          />
          <button
            onClick={handleSave}
            style={{
              color: "white",
              backgroundColor: "#799be3",
              border: "none",
              borderRadius: "10px",
              fontSize: "small",
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Budget"}
          </button>
        </div>

        {message && <p className="profile-message">{message}</p>}

        <button
          onClick={handleLogout}
          id="logout-button"
          className="logout-button profile-button"
          style={{ backgroundColor: "#CB0404" }}
        >
          <IoMdLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
