import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth";
import { IoMdAdd } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import axios from "axios";

export default function FamilyDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [memberOrders, setMemberOrders] = useState({});
  const [showFamilyId, setShowFamilyId] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (user?.f_id != null) {
        try {
          const res = await axios.get(
            `http://localhost:3000/family-members/${user.f_id}`
          );
          if (res.data.success) {
            setMembers(res.data.members);
          }
        } catch (error) {
          console.error("Failed to fetch family members:", error);
        }
      }
    };

    fetchMembers();
  }, [user?.f_id]);

  const fetchMemberOrders = async (memberId) => {
    if (memberOrders[memberId]) return;

    try {
      const res = await axios.get(`http://localhost:3000/orders/${memberId}`);
      setMemberOrders((prev) => ({
        ...prev,
        [memberId]: res.data,
      }));
    } catch (error) {
      console.error("Failed to fetch orders for member", memberId, error);
    }
  };

  const handleToggleCard = (id) => {
    const newId = expandedMemberId === id ? null : id;
    setExpandedMemberId(newId);
    if (newId) fetchMemberOrders(newId);
  };

  const handleCreateFamily = async () => {
    try {
      const res = await axios.post("http://localhost:3000/create-family", {
        userId: user.id,
        budget: 0,
      });

      if (res.data.f_id) {
        const updatedUser = {
          ...user,
          f_id: res.data.f_id,
          f_role: "head",
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to create family:", error);
    }
  };

  const handleExitFamily = async () => {
    const confirmExit = window.confirm(
      "Are you sure you want to leave the family?"
    );
    if (!confirmExit) return;

    try {
      const res = await axios.post("http://localhost:3000/exit-family", {
        userId: user.id,
      });

      if (res.data.success) {
        const updatedUser = {
          ...user,
          f_id: null,
          f_role: null,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert("Failed to exit family.");
      }
    } catch (error) {
      console.error("Error exiting family:", error);
      alert("Error exiting family.");
    }
  };

  const handleJoinFamily = async () => {
    const f_id = prompt("Enter Family ID to join:");
    if (!f_id || isNaN(f_id)) {
      alert("Please enter a valid numeric Family ID.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/join-family", {
        userId: user.id,
        f_id: parseInt(f_id),
      });

      if (res.data.success) {
        const updatedUser = {
          ...user,
          f_id: parseInt(f_id),
          f_role: "member",
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert(res.data.message || "Failed to join family.");
      }
    } catch (error) {
      console.error("Failed to join family:", error);
      alert("Error joining family.");
    }
  };

  return (
    <div style={{ marginTop: "100px", padding: "20px" }}>
      {user?.f_id === null ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            gap: "50px",
          }}
        >
          <button
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "20px",
              height: "60px",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleCreateFamily}
          >
            <IoMdAdd style={{ marginRight: "5px" }} />
            Create Family
          </button>
          <button
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              padding: "20px",
              height: "60px",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleJoinFamily}
          >
            <FaUserFriends style={{ marginRight: "5px" }} />
            Join Family
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
            Family Members
          </h2>
          {user?.f_id && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "10px",
              }}
            >
              <button
                onClick={() => setShowFamilyId(!showFamilyId)}
                style={{
                  backgroundColor: "#eee",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showFamilyId ? "Hide Family ID" : "Show Family ID"}
              </button>
            </div>
          )}
          {showFamilyId && user?.f_id && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px",
                color: "#555",
              }}
            >
              <strong style={{ marginRight: "4px" }}>Family ID: </strong>{" "}
              {user.f_id}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "20px",
            }}
          >
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleToggleCard(member.id)}
              >
                <h3>{member.id === user.id ? "You" : member.name}</h3>
                <p>Email: {member.email}</p>
                <p>
                  Role:{" "}
                  <strong
                    style={{
                      color: member.f_role === "head" ? "#4CAF50" : "#2196F3",
                    }}
                  >
                    {member.f_role.charAt(0).toUpperCase() +
                      member.f_role.slice(1)}
                  </strong>
                </p>

                {expandedMemberId === member.id && (
                  <div style={{ marginTop: "15px" }}>
                    {member.age !== null && <p>Age: {member.age}</p>}
                    {member.gender && <p>Gender: {member.gender}</p>}
                    {member.location && <p>Location: {member.location}</p>}
                    {member.fav_category && (
                      <p>Fav Category: {member.fav_category}</p>
                    )}
                    {member.budget !== null && (
                      <p>Budget: ₹{member.budget.toFixed(2)}</p>
                    )}
                    <p>
                      Joined: {new Date(member.created_at).toLocaleString()}
                    </p>

                    <div style={{ marginTop: "20px" }}>
                      <h4 style={{ marginBottom: "10px", color: "#444" }}>
                        Order History
                      </h4>

                      {memberOrders[member.id]?.length === 0 ? (
                        <p style={{ fontStyle: "italic" }}>No orders yet.</p>
                      ) : (
                        memberOrders[member.id]?.map((order) => (
                          <div
                            key={order.p_id}
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: "12px",
                              padding: "15px",
                              marginBottom: "20px",
                              backgroundColor: "#fafafa",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            }}
                          >
                            <div style={{ marginBottom: "10px" }}>
                              <strong>Purchase Date:</strong>{" "}
                              {new Date(
                                order.purchase_date
                              ).toLocaleDateString()}
                              <br />
                              <strong>Total Amount:</strong> ₹
                              {order.total_amount.toFixed(2)}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              {order.items.map((item) => (
                                <div
                                  key={item.item_id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    padding: "10px",
                                    backgroundColor: "#fff",
                                    borderRadius: "10px",
                                    border: "1px solid #eee",
                                  }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.product_name}
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      border: "1px solid #ddd",
                                    }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <p
                                      style={{ margin: 0, fontWeight: "bold" }}
                                    >
                                      {item.product_name}
                                    </p>
                                    <p
                                      style={{
                                        margin: "3px 0",
                                        fontSize: "14px",
                                      }}
                                    >
                                      ₹{item.subtotal.toFixed(2)} (x
                                      {item.quantity})
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        color: "#777",
                                      }}
                                    >
                                      Rating: ⭐{item.rating} ({item.reviews}{" "}
                                      reviews)
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              style={{
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                padding: "15px 30px",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={handleExitFamily}
            >
              Exit Family
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
