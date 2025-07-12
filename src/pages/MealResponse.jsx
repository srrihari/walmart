import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MealResponse({ response, onRegenerate, onConfirm, scrollRef }) {
  const [confirmed, setConfirmed] = useState(false);
  const [showCheckCart, setShowCheckCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setConfirmed(false);
    setShowCheckCart(false);
    setLoading(false);
    setShowToast(false);
    setTimeout(() => {
      if (scrollRef?.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  }, [response]);

  if (!response) return null;

  let parsed;
  try {
    parsed = typeof response === "string" ? JSON.parse(response) : response;
  } catch (err) {
    return <p className="plain-response">{response}</p>;
  }

  const { meal_plan, ingredients: ingr } = parsed;

  const handleYes = async () => {
    setLoading(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to add items to your cart.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/grocery-search", {
        ingredients: ingr,
      });

      const matches = res.data?.matches || [];
      console.log("unfiltered:", matches.length);
      // ✅ Remove duplicates and null products
      const uniqueIds = new Set();
      const validMatches = matches.filter((match) => {
        const p = match.product;
        if (!p || uniqueIds.has(p.id)) return false;
        uniqueIds.add(p.id);
        return true;
      });
      console.log("Filtered", validMatches.length);
      if (validMatches.length === 0) {
        console.warn("⚠️ No valid products found.");
        setLoading(false);
        return;
      }

      await Promise.all(
        validMatches.map(async (match) => {
          const item = match.product;
          const category = item.category?.toLowerCase() || "foodgroceries";
          try {
            await axios.post("http://localhost:3000/cart/add", {
              user_id: parseInt(userId),
              category,
              product_id: item.id,
              quantity: 1,
            });
          } catch (err) {
            console.error("❌ Failed to add:", item.name, err);
          }
        })
      );

      setConfirmed(true);
      setShowCheckCart(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    } finally {
      setLoading(false);
    }

    if (typeof onConfirm === "function") onConfirm(ingr);
  };

  const handleNo = () => {
    setConfirmed(false);
    setShowCheckCart(false);
    setLoading(false);
    if (typeof onRegenerate === "function") onRegenerate();
  };

  return (
    <div className="structured-response" style={{ position: "relative" }}>
      {/* ✅ Toast */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#28a745",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            animation: "slideUpFade 0.4s ease forwards",
            zIndex: 9999,
          }}
        >
          ✅ Items added to your cart!
        </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          0% { transform: translate(-50%, 20px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      {!confirmed && meal_plan && (
        <>
          <h3
            style={{
              fontWeight: "bold",
              fontSize: "2.4rem",
              color: "#5C4033",
              fontFamily: "'Chakra Petch', sans-serif",
              fontStyle: "italic",
              margin: "0",
            }}
          >
            Here's your meal plan suggestion:
          </h3>

          {Object.entries(meal_plan).map(([day, meals]) => (
            <div key={day} style={{ marginBottom: "1rem" }}>
              <center>
                <h4
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#4B4B4B",
                    fontFamily: '"Savate", sans-serif',
                    marginTop: "25px",
                  }}
                >
                  {day}:
                </h4>
              </center>

              <ul
                style={{
                  marginLeft: "1.5rem",
                  listStyleType: "disc",
                  color: "black",
                }}
              >
                {Object.entries(meals).map(([mealTime, mealItem]) => (
                  <li key={mealTime}>
                    <strong
                      style={{
                        fontFamily: '"Courgette", cursive',
                        color: "#4B352A",
                        fontSize: "20px",
                      }}
                    >
                      {mealTime}:
                    </strong>{" "}
                    <strong
                      style={{
                        fontFamily: '"Advent Pro", sans-serif',
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#B22222",
                      }}
                    >
                      {mealItem}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {loading && (
            <p
              style={{
                marginTop: "10px",
                color: "#444",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "sans-serif",
                textAlign: "center",
              }}
            >
              🍳 Let’s cook your meal... Hang tight while we add your items to
              the cart!
            </p>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                fontFamily: '"Tagesschrift", system-ui',
                fontWeight: 400,
                fontSize: "30px",
              }}
            >
              You wanna go ahead with this meal plan?
            </p>
            <div>
              <button
                onClick={handleYes}
                disabled={loading}
                style={{
                  marginRight: "1rem",
                  padding: "6px 12px",
                  color: "white",
                  background: "#77B254",
                  borderRadius: "9999px",
                  border: "2px solid #222",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  boxShadow: "4px 4px 0px #222",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "transform 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.target.style.transform = "translate(-2px, -2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "none";
                }}
              >
                {loading ? "Processing..." : "Yes"}
              </button>

              <button
                onClick={handleNo}
                disabled={loading}
                style={{
                  marginRight: "1rem",
                  padding: "6px 12px",
                  color: "white",
                  background: "#FF3F33",
                  borderRadius: "9999px",
                  border: "2px solid #222",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  boxShadow: "4px 4px 0px #222",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "transform 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.target.style.transform = "translate(3px, -3px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "none";
                }}
              >
                No, regenerate
              </button>
            </div>
          </div>
        </>
      )}

      {confirmed && showCheckCart && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <p style={{ fontSize: "18px", color: "green" }}>
            Items have been added to your cart!
          </p>
          <button
            onClick={() => navigate("/cart")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffa41c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            🛒 Check Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default MealResponse;
