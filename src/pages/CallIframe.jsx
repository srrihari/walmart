import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CallIframe() {
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cammerceProduct");
    if (stored) {
      setProduct(JSON.parse(stored));
    }
  }, []);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !product) return;

    setAdding(true);

    let mappedCategory = product.category;
    if (mappedCategory === "school_utensils") mappedCategory = "schoolutensils";
    else if (mappedCategory === "Vehicle_care") mappedCategory = "vehiclecare";
    else if (mappedCategory === "body_care_diet")
      mappedCategory = "bodycarediet";
    else if (mappedCategory === "cloth_accessories") mappedCategory = "cloth";
    else if (mappedCategory === "Groceries") mappedCategory = "foodgroceries";

    try {
      await axios.post("http://localhost:3000/cart/add", {
        user_id: parseInt(userId),
        category: mappedCategory,
        product_id: product.id,
        quantity: 1,
      });
      alert("Item added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add item to cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row", // <-- Horizontal layout
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        marginTop: "100px",
      }}
    >
      {/* Left: Product Info */}
      <div
        style={{
          width: "200px",
          padding: "20px",
          borderRight: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          overflowY: "auto",
        }}
      >
        {product ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />
            <h2 style={{ marginBottom: "10px" }}>{product.name}</h2>
            <p>
              <strong>Price:</strong> ₹{product.price}
            </p>
            <p>
              <strong>In Stock:</strong> {product.in_stock ? "Yes" : "No"}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || adding}
              style={{
                marginTop: "15px",
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#ffa41c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: product.in_stock ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
            >
              {adding ? "Adding..." : "🛒 Add to Cart"}
            </button>
          </>
        ) : (
          <p>Loading product info...</p>
        )}
      </div>

      {/* Right: Video Call */}
      <iframe
        src="https://srrihariappcall.netlify.app"
        title="Call Interface"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ flex: 1, border: "none" }}
      />
    </div>
  );
}
