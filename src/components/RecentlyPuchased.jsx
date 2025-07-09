import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { AuthContext } from "../auth";
import Heading from "./Heading";
import { useNavigate } from "react-router-dom";

export default function RecentlyPurchased() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const categoryDisplayMap = {
    electronics: "Electronics",
    bodycarediet: "Body Care & Diet",
    cloth: "Clothing, Handbags, Watches & Accessories",
    household: "Household",
    pet: "Pets",
    vehiclecare: "Vehicle Care",
    schoolutensils: "School Utensils",
    foodgroceries: "Foods & Groceries",
  };

  // Maps backend table name to frontend route slug
  const mapCategoryToSlug = (category) => {
    switch (category) {
      case "schoolutensils":
        return "school_utensils";
      case "electronics":
        return "Electronics";
      case "vehiclecare":
        return "Vehicle_care";
      case "bodycarediet":
        return "body_care_diet";
      case "cloth":
        return "cloth_accessories";
      case "foodgroceries":
        return "Groceries";
      case "household":
        return "Household";
      default:
        return category?.toLowerCase(); // fallback
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/orders/${user.id}`);
        const allItems = res.data.flatMap((order) => order.items || []);

        // Filter unique by product_id + category combo
        const seen = new Set();
        const uniqueItems = allItems.filter((item) => {
          const key = `${item.product_id}-${item.category}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Group by original category
        const grouped = {};
        uniqueItems.forEach((item) => {
          const category = item.category;
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(item);
        });

        setProductsByCategory(grouped);
      } catch (err) {
        console.error("Error fetching orders:", err);
        alert("Failed to load recently purchased items.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleAddToCart = async (product, categoryKey) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/cart/add", {
        user_id: parseInt(userId),
        category: categoryKey,
        product_id: product.product_id,
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
        Loading recently purchased items...
      </div>
    );

  if (Object.keys(productsByCategory).length === 0)
    return (
      <div style={{ paddingTop: "100px", textAlign: "center" }}>
        No recently purchased items found.
      </div>
    );

  return (
    <div style={{ padding: "16px", paddingTop: "100px" }}>
      <Heading category="Recently Purchased Items" />
      {Object.entries(productsByCategory).map(([categoryKey, products]) => {
        const mappedCategory = mapCategoryToSlug(categoryKey);

        return (
          <div key={categoryKey} style={{ marginBottom: "40px" }}>
            <h2 style={{ paddingLeft: "50px", marginBottom: "16px" }}>
              {categoryDisplayMap[mappedCategory] || mappedCategory}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "30px",
                paddingLeft: "50px",
              }}
            >
              {products.map((product) => (
                <div
                  key={`${product.product_id}-${categoryKey}`}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/product/${mappedCategory}/${product.product_id}`)
                  }
                >
                  <ProductCard
                    image={product.image || product.image_url}
                    alt={product.product_name}
                    price={`Rs.${product.price}`}
                    title={product.product_name}
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
        );
      })}
    </div>
  );
}
