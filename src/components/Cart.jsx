import React, { useEffect, useState } from "react";
import axios from "axios";
import Heading from "./Heading";
import Recommend from "./Recommend";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchCartItems = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${userId}`);
        const cartData = res.data;

        const enrichedItems = await Promise.all(
          cartData.map(async (item) => {
            try {
              const categoryRoute = item.category.toLowerCase();
              const productRes = await axios.get(
                `http://localhost:3000/${categoryRoute}?id=${item.product_id}`
              );

              const product = productRes.data?.data?.[0];
              return {
                ...item,
                productDetails: product,
              };
            } catch (err) {
              console.error(
                "Failed to fetch product for cart item:",
                item,
                err
              );
              return item;
            }
          })
        );
        console.log(enrichedItems);

        setCartItems(enrichedItems);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };

    fetchCartItems();
  }, [userId]);

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`http://localhost:3000/cart/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const getTotalCost = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.productDetails?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.productDetails?.price || 0,
        category: item.category,
      }));

      await axios.post(`http://localhost:3000/checkout/${userId}`, {
        items,
      });

      alert("Checkout successful!");
      setCartItems([]); // clear the cart visually
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Try again.");
    }
  };

  if (!userId) {
    return <p style={{ padding: "100px" }}>Please log in to view your cart.</p>;
  }

  return (
    <div style={{ padding: "16px", paddingTop: "100px" }}>
      <Heading category={"Your Cart"} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Cart Items */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            paddingLeft: "50px",
            flex: 3,
          }}
        >
          {cartItems
            .filter((item) => item.productDetails) // 👈 Only include items with valid productDetails
            .map((item) => {
              const product = item.productDetails;

              return (
                <div key={item.id} className="product-card">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image"
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />

                  <button
                    className="add-button"
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      marginTop: "10px",
                    }}
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>

                  <div className="price-row">
                    <span className="price">Rs.{product.price}</span>
                  </div>

                  <p className="product-title">{product.name}</p>

                  <div className="rating">
                    <span className="stars">
                      {"★".repeat(Math.round(product.rating || 0))}
                      {"☆".repeat(5 - Math.round(product.rating || 0))}
                    </span>
                    <span className="reviews">({product.reviews || 0})</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right: Checkout Box */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            marginLeft: "30px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            height: "fit-content",
            position: "sticky",
            top: "100px",
            background: "#fafafa",
          }}
        >
          <h2>Checkout Summary</h2>
          <p>Total Items: {cartItems.length}</p>
          <p>
            <strong>Total Cost:</strong>{" "}
            <span style={{ color: "#CB0404" }}>
              Rs.{getTotalCost().toFixed(2)}
            </span>
          </p>
          <button
            id="checkout-button"
            onClick={handleCheckout}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: getTotalCost() === 0 ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: getTotalCost() === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      <Recommend />
    </div>
  );
}
