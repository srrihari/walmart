import { useState, useEffect } from "react";
import { Atom } from "react-loading-indicators";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

function QueryResponse(props) {
  const [responses, setResponses] = useState(props.response || "");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isProductResponse =
    responses && typeof responses === "object" && responses.results;

  useEffect(() => {
    async function maybeTranslate() {
      setLoading(true);
      const text =
        typeof props.response === "string"
          ? props.response
          : JSON.stringify(props.response);
      setResponses(props.response);

      if (props.lang && props.lang !== "en-IN") {
        try {
          const res = await fetch("https://api.sarvam.ai/translate", {
            method: "POST",
            headers: {
              "api-subscription-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: text,
              source_language_code: "auto",
              target_language_code: props.lang,
            }),
          });

          const translated = await res.json();
          setTranslatedText(translated?.translated_text || text);
        } catch (err) {
          console.error("Translation failed", err);
          setTranslatedText(text); // fallback
        }
      } else {
        setTranslatedText(text);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false); // End loading
    }

    maybeTranslate();
  }, [props.response, props.lang]);

  // ✅ Add to cart
  const handleAddToCart = async (product, rawCategory) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }
    const mapCategory = (category) => {
      const lower = category.toLowerCase();
      const map = {
        groceries: "foodgroceries",
        school_utensils: "schoolutensils",
        vehicle_care: "vehiclecare",
        body_care_diet: "bodycarediet",
        cloth_accessories: "cloth",
      };
      return map[lower] || lower;
    };

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

  // ✅ Navigate to product view
  const handleProductClick = (product, category) => {
    navigate(`/product/${category}/${product.id}`);
  };

  return (
    <div
      className="query-response-container"
      style={{ width: "800px", height: "500px" }}
    >
      <div
        style={{
          backgroundColor: "#481f1f",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "5px",
          height: "465px",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div
            style={{
              minHeight: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Atom
              color="#ffffff"
              size="large"
              text="Loading..."
              textColor="#ffffff"
            />
          </div>
        ) : isProductResponse ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {responses.results.map((item) => {
              const matched = responses.matched?.table || "electronics";
              const category = matched;

              return (
                <div
                  key={item.id}
                  onClick={() => handleProductClick(item, category)}
                  style={{ cursor: "pointer" }}
                >
                  <ProductCard
                    image={item.image_url}
                    alt={item.name}
                    price={`₹${item.price}`}
                    originalPrice={`₹${item.original_price}`}
                    savings={`₹${(item.original_price - item.price).toFixed(
                      2
                    )}`}
                    title={item.name}
                    rating={Math.round(item.rating)}
                    reviews={item.reviews}
                    membershipNote={
                      item.free_shipping ? "Free Shipping Available" : ""
                    }
                    availability={[
                      item.in_stock
                        ? "Available <strong>in stock</strong>"
                        : "Out of stock",
                      item.free_shipping
                        ? "Free <strong>shipping</strong>"
                        : "Shipping not available",
                    ]}
                    onAddToCart={(e) => {
                      e.stopPropagation(); // so that it doesn't trigger the product click
                      handleAddToCart(item, category);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : translatedText && translatedText !== "null" ? (
          <div
            style={{
              color: "#ffd9c8",
              fontSize: "16px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {translatedText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default QueryResponse;
