import React, { useEffect, useState, useRef, useCallback } from "react";
import Heading from "../components/Heading";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

export default function Electronics() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(null);

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const observer = useRef();
  const navigate = useNavigate();

  // Add to cart handler
  const handleAddToCart = async (product) => {
    const userId = localStorage.getItem("userId");
    console.log("Adding to cart. User ID:", userId, "Product:", product.id);

    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/cart/add", {
        user_id: parseInt(userId),
        category: "electronics",
        product_id: product.id,
        quantity: 1,
      });

      alert("Item added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add item to cart.");
    }
  };

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/Electronics/${productId}`);
  };

  const lastProductRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Fetch products by page and optional category
  useEffect(() => {
    setLoading(true);
    const query = categoryParam
      ? `category=${encodeURIComponent(categoryParam)}&`
      : "";
    axios
      .get(`http://localhost:3000/electronics?${query}page=${page}&limit=100`)
      .then((res) => {
        setProducts((prev) =>
          page === 1 ? res.data.data : [...prev, ...res.data.data]
        );
        setHasMore(res.data.data.length > 0);
        setTotalCount(res.data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setLoading(false);
      });
  }, [page, categoryParam]);

  // Reset page when category changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [categoryParam]);

  return (
    <div style={{ padding: "16px", paddingTop: "100px" }}>
      <Heading category={categoryParam || "All Categories"} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          paddingLeft: "50px",
        }}
      >
        {products.map((product, index) => {
          const isLast = products[products.length - 1]?.id === product.id;
          return (
            <div
              key={product.id}
              ref={isLast ? lastProductRef : null}
              style={{ cursor: "pointer" }}
              onClick={() => handleProductClick(product.id)}
            >
              <ProductCard
                image={product.image_url}
                alt={product.name}
                price={`Rs.${product.price}`}
                originalPrice={`Rs.${product.original_price}`}
                savings={`Rs.${(product.original_price - product.price).toFixed(
                  2
                )}`}
                title={product.name}
                rating={Math.round(parseFloat(product.rating))}
                reviews={product.reviews}
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
                  e.stopPropagation(); // prevent card click from triggering product detail navigation
                  handleAddToCart(product);
                }}
              />
            </div>
          );
        })}
      </div>

      {loading && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>
      )}
      {!hasMore && !loading && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          You've reached the end. ({products.length} loaded)
        </p>
      )}
    </div>
  );
}
