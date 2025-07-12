import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

function ProdResponse({ response, onRegenerate, scrollRef, hasQueried }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const scrollToTop = () => {
    setTimeout(() => {
      if (scrollRef?.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToTop();
  }, [response]);

  // 🧠 Extract actual product list & matched table name
  const productList = response?.results || [];
  const matchedCategory = response?.matched?.table || "electronics";

  if (hasQueried && productList.length === 0) {
    return (
      <p style={{ fontStyle: "italic", color: "gray" }}>
        No matching products found.
      </p>
    );
  }

  if (!hasQueried) {
    return null;
  }

  const mapCategory = (category) => {
    const lower = (category || "").toLowerCase();
    const map = {
      groceries: "foodgroceries",
      school_utensils: "schoolutensils",
      vehicle_care: "vehiclecare",
      body_care_diet: "bodycarediet",
      cloth_accessories: "cloth",
    };
    return map[lower] || lower;
  };

  const handleAddToCart = async (product, rawCategory) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    const category = mapCategory(rawCategory);

    try {
      await fetch("http://localhost:3000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId),
          category,
          product_id: product.id,
          quantity: 1,
        }),
      });

      alert("Item added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Error adding to cart");
    }
  };

  const handleProductClick = (product, category) => {
    navigate(`/product/${category}/${product.id}`);
  };

  return (
    <div
      className="product-response"
      style={{ height: "300px", width: "900px" }}
    >
      <h3
        style={{
          fontWeight: "bold",
          fontSize: "1.8rem",
          color: "#4B352A",
          fontFamily: "'Chakra Petch', sans-serif",
        }}
      >
        Matching Products 🛍️
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {productList.map((product) => {
          const rawCategory = product.category || matchedCategory; // ✅ fallback to matched.table
          const mappedCategory = mapCategory(rawCategory); // for cart only

          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product, rawCategory)}
              style={{ cursor: "pointer" }}
            >
              <ProductCard
                image={product.image || "/fallback.png"}
                alt={product.name}
                price={`₹${product.price}`}
                originalPrice={`₹${product.original_price || product.price}`}
                savings={`₹${(
                  (product.original_price || product.price) - product.price
                ).toFixed(2)}`}
                title={product.name}
                rating={Math.round(product.rating || 4)}
                reviews={product.reviews || 0}
                membershipNote={
                  product.free_shipping ? "Free Shipping Available" : ""
                }
                availability={[
                  product.in_stock
                    ? "Available <strong>in stock</strong>"
                    : "Out of stock",
                  product.free_shipping
                    ? "Free <strong>shipping</strong>"
                    : "Shipping not available",
                ]}
                onAddToCart={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product, rawCategory);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProdResponse;
