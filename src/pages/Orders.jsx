import React, { useEffect, useState, useContext } from "react";
import OrderItemCard from "../components/OrderItemCard";
import { AuthContext } from "../auth";
import Heading from "../components/Heading";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:3000/orders/${user.id}`);
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    if (user?.id) fetchOrders();
  }, [user]);

  const toggleExpand = (p_id) => {
    setExpandedOrderId(expandedOrderId === p_id ? null : p_id);
  };

  if (!orders.length) {
    return (
      <p style={{ marginTop: "100px", textAlign: "center" }}>
        No orders found.
      </p>
    );
  }

  return (
    <div style={{ marginTop: "100px" }}>
      <Heading category={"Order History"} />
      <div
        className="orders-container"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",

          alignItems: "center",
        }}
      >
        {orders.map((order) => (
          <div
            key={order.p_id}
            className="order-card"
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9",
              width: "1200px",
            }}
          >
            <div
              onClick={() => toggleExpand(order.p_id)}
              style={{ cursor: "pointer" }}
            >
              <p>
                <strong>Order ID:</strong> {order.p_id}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.purchase_date).toDateString()}
              </p>
              <p>
                <strong>Total Amount:</strong> Rs.
                {order.total_amount.toFixed(2)}
              </p>
              <p style={{ color: "blue" }}>
                {expandedOrderId === order.p_id
                  ? "Hide items ▲"
                  : "View items ▼"}
              </p>
            </div>

            {expandedOrderId === order.p_id &&
              (() => {
                return (
                  <div
                    className="order-items"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "20px",
                      marginTop: "20px",
                    }}
                  >
                    {Array.isArray(order.items) &&
                      order.items.map((item) => {
                        console.log("Rendering item image URL:", item.image); // ✅ Add this line

                        return (
                          <OrderItemCard
                            key={item.item_id}
                            image={item.image || "/placeholder.jpg"}
                            alt={item.product_name}
                            title={
                              item.product_name || `Product #${item.product_id}`
                            }
                            price={item.price}
                            rating={item.rating || 4}
                            reviews={
                              item.reviews || Math.floor(Math.random() * 50)
                            }
                          />
                        );
                      })}
                  </div>
                );
              })()}
          </div>
        ))}
      </div>
    </div>
  );
}
