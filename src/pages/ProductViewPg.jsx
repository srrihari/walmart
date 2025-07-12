import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaCartPlus } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { FaQuestionCircle } from "react-icons/fa";
export default function ProductViewPg() {
  const navigate = useNavigate();
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
      if (category === "school_utensils") mappedCategory = "schoolutensils";
      else if (category === "Vehicle_care") mappedCategory = "vehiclecare";
      else if (category === "body_care_diet") mappedCategory = "bodycarediet";
      else if (category === "cloth_accessories") mappedCategory = "cloth";
      else if (category === "Groceries") mappedCategory = "foodgroceries";

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

  if (!product) return <div style={{ paddingTop: "100px" }}>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        padding: "100px 50px",
        gap: "50px",
        alignItems: "flex-start",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Left Column - Image */}
      <div>
        <img
          src={product.image_url}
          alt={product.name}
          width="350"
          style={{ borderRadius: "8px" }}
        />
      </div>

      {/* Right Column - Details */}
      <div style={{ maxWidth: "600px" }}>
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "10px",
            fontWeight: "bolder",
          }}
        >
          {product.name}
        </h1>

        {product.seller_name && (
          <p>
            <strong>Seller: </strong>
            {product.seller_name === "Walmart.com"
              ? "Walmart"
              : product.seller_name}
          </p>
        )}
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <p>
          <strong>Sub-category:</strong> {product.sub_category}
        </p>
        {product.description && (
          <p>
            <strong>Description:</strong> {product.description}
          </p>
        )}
        <h2 style={{ color: "#B12704", marginTop: "15px" }}>
          ₹{product.price.toLocaleString("en-IN")}
        </h2>

        <p>
          <strong>Rating:</strong> {product.rating}
        </p>
        <p>
          <strong>Reviews:</strong> {product.reviews}
        </p>
        <p>
          <strong>Stock Status:</strong>{" "}
          {product.in_stock ? (
            "In Stock"
          ) : (
            <span style={{ color: "red" }}>Out of Stock</span>
          )}
        </p>
        <p>
          <strong>Shipping:</strong>{" "}
          {product.free_shipping
            ? "Free Shipping Available"
            : "No Free Shipping"}
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || adding}
            style={{
              marginTop: "20px",
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
            {adding ? (
              "Adding..."
            ) : (
              <>
                <FaCartPlus style={{ marginRight: "8px" }} />
                Add to Cart
              </>
            )}
          </button>
          <Link to={`/product/${category}/${id}/faq`}>
            <button
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#ff511cff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: product.in_stock ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FaQuestionCircle />
                ProDoubt
              </div>
            </button>
          </Link>
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.setItem("cammerceProduct", JSON.stringify(product));
          navigate(`/call`);
        }}
        style={{
          padding: "5px 9px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        <IoVideocam style={{ marginRight: "8px" }} />
        Cammerce
      </button>
    </div>
  );
}
