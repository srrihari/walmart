import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProductViewPg() {
  const { category, id } = useParams();
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/product/${category}/${id}`
        );
        setProduct(res.data);
      } catch (err) {
        console.error("Product fetch error:", err);
      }
    };

    fetchProduct();
  }, [category, id]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setAdding(true);

    try {
      let mappedCategory = category;
      if (category === "school_utensils") {
        mappedCategory = "schoolutensils";
      } else if (category === "Vehicle_care") {
        mappedCategory = "vehiclecare";
      } else if (category === "body_care_diet") {
        mappedCategory = "bodycarediet";
      } else if (category === "cloth_accessories") {
        mappedCategory = "cloth";
      } else if (category === "Groceries") {
        mappedCategory = "foodgroceries";
      }

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

  if (!product)
    return <div style={{ paddingTop: "100px" }}>Loading product...</div>;

  return (
    <div
      style={{ paddingTop: "100px", paddingLeft: "50px", maxWidth: "800px" }}
    >
      <h1>{product.name}</h1>
      <img
        src={product.image_url}
        alt={product.name}
        width="300"
        style={{ borderRadius: "8px", marginBottom: "20px" }}
      />
      <p>
        <strong>ID:</strong> {product.id}
      </p>
      <p>
        <strong>Seller:</strong> {product.seller_name}
      </p>
      <p>
        <strong>Category:</strong> {product.category}
      </p>
      <p>
        <strong>Sub-category:</strong> {product.sub_category}
      </p>
      <p>
        <strong>Description:</strong> {product.description}
      </p>
      <p>
        <strong>Price:</strong> Rs.{product.price}
      </p>
      <p>
        <strong>Rating:</strong> {product.rating}
      </p>
      <p>
        <strong>Reviews:</strong> {product.reviews}
      </p>
      <p>
        <strong>Stock Status:</strong>{" "}
        {product.in_stock ? "In Stock" : "Out of Stock"}
      </p>
      <p>
        <strong>Shipping:</strong>{" "}
        {product.free_shipping ? "Free Shipping Available" : "No Free Shipping"}
      </p>

      <button
        onClick={handleAddToCart}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
