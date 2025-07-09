import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";
import Heading from "./Heading";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Recommend() {
  // Map for display purposes only
  const navigate = useNavigate();

  const categoryDisplayMap = {
    Electronics: "Electronics",
    body_care_diet: "Body Care & Diet",
    cloth_accessories: "Clothing, Handbags, Watches & Accessories",
    Household: "Household",
    pet: "Pets",
    Vehicle_care: "Vehicle Care",
    schoolutensils: "School Utensils",
    foodgroceries: "Foods & Groceries",
  };

  const [recommended, setRecommended] = useState({});
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/recommend?userId=${userId}`
        );
        console.log("Fetched recommendations:", response.data.recommended);
        setRecommended(response.data.recommended || {});
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  // Always pass backend-friendly categoryKey
  const handleAddToCart = async (product, categoryKey) => {
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      if (categoryKey == "school_utensils") {
        categoryKey = "schoolutensils";
      } else if (categoryKey == "Vehicle_care") {
        categoryKey = "vehiclecare";
      } else if (categoryKey == "body_care_diet") {
        categoryKey = "bodycarediet";
      } else if (categoryKey == "cloth_accessories") {
        categoryKey = "cloth";
      } else if (categoryKey == "Groceries") {
        categoryKey = "foodgroceries";
      }
      await axios.post("http://localhost:3000/cart/add", {
        user_id: parseInt(userId),
        category: categoryKey, // ✅ correct backend key
        product_id: product.id,
        quantity: 1,
      });

      alert("Item added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add item to cart.");
    }
  };

  if (loading)
    return (
      <div style={{ paddingTop: "100px", textAlign: "center" }}>
        Loading recommendations...
      </div>
    );

  return (
    <div style={{ padding: "16px", paddingTop: "100px", marginTop: "100px" }}>
      <Heading category={"Recommended for You"} />
      {Object.entries(recommended).map(([categoryKey, products]) => (
        <div key={categoryKey} style={{ marginBottom: "40px" }}>
          <h2 style={{ paddingLeft: "50px", marginBottom: "16px" }}>
            {categoryDisplayMap[categoryKey] || categoryKey}
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "30px",
              paddingLeft: "50px",
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(`/product/${categoryKey}/${product.id}`)
                }
              >
                <ProductCard
                  image={product.image_url}
                  alt={product.name}
                  price={`Rs.${product.price}`}
                  title={product.name}
                  rating={Math.round(parseFloat(product.rating))}
                  reviews={product.reviews}
                  membershipNote={
                    product.free_shipping ? "Free Shipping Available" : ""
                  }
                  availability={[
                    product.in_stock ? "Available in stock" : "Out of stock",
                    product.free_shipping
                      ? "Free shipping"
                      : "Shipping not available",
                  ]}
                  onAddToCart={() => handleAddToCart(product, categoryKey)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
