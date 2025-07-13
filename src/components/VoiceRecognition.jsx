import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsMicFill } from "react-icons/bs";

const FloatingVoiceButton = () => {
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunks.current = [];

    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm", { type: "audio/webm" });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:3001/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const command = data.transcription
          ?.toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .trim();
        console.log("🎙️ You said:", command);
        handleCommand(command);
      } catch (err) {
        console.error("❌ Error during transcription:", err);
        alert("Failed to transcribe. Check server.");
      }
    };

    recorder.start();
    setIsRecording(true);

    setTimeout(() => {
      recorder.stop();
      setIsRecording(false);
    }, 4000);

    mediaRecorderRef.current = recorder;
  };

  const handleCommand = (command = "") => {
    const isProductPage = /^\/product\/[^/]+\/[^/]+$/.test(location.pathname);

    // 🌐 Navigation commands
    const routes = [
      { keywords: ["home"], path: "/" },
      { keywords: ["electronics"], path: "/electronics" },
      { keywords: ["groceries", "food"], path: "/foodgroceries" },
      { keywords: ["household"], path: "/household" },
      { keywords: ["vehicle care"], path: "/vehiclecare" },
      { keywords: ["body care", "diet"], path: "/bodycarediet" },
      { keywords: ["cloth", "accessories"], path: "/cloth" },
      { keywords: ["pet"], path: "/pet" },
      { keywords: ["school", "utensils"], path: "/schoolutensils" },
      { keywords: ["login"], path: "/login" },
      { keywords: ["register"], path: "/register" },
      { keywords: ["profile"], path: "/profile" },
      { keywords: ["cart"], path: "/cart" },
      { keywords: ["orders"], path: "/orders" },
      { keywords: ["call"], path: "/call" }, // General call page (used ONLY IF no product call)
      { keywords: ["image mart", "image search"], path: "/imagomart" },
      { keywords: ["dashboard", "family"], path: "/familydashboard" },
      { keywords: ["tastiai", "meal planner"], path: "/tastiai" },
      { keywords: ["prodgest", "search"], path: "/prodgest" },
    ];

    // 🔁 First check for NAVIGATION commands
    const navMatch = routes.find((route) =>
      route.keywords.some((word) => command.includes(word))
    );

    if (
      command.includes("add to cart") ||
      command.includes("call") ||
      command.includes("query") ||
      command.includes("faq")
    ) {
      if (!isProductPage) {
        alert("⚠️ Please open a product before using this command.");
        return;
      }

      if (command.includes("add to cart")) {
        if (typeof window.voiceAddToCart === "function") {
          window.voiceAddToCart();
        } else {
          alert("❌ Add to cart function not available.");
        }
      } else if (command.includes("call")) {
        if (typeof window.voiceCallDealer === "function") {
          window.voiceCallDealer();
        } else {
          alert("❌ Call dealer function not available.");
        }
      } else if (command.includes("query") || command.includes("faq")) {
        if (typeof window.voiceProductQuery === "function") {
          window.voiceProductQuery();
        } else {
          alert("❌ Product query function not available.");
        }
      }
      return;
    }
    if (command.includes("checkout") || command.includes("check out")) {
      if (location.pathname === "/cart") {
        const checkoutBtn = document.getElementById("checkout-button");
        if (checkoutBtn) {
          if (checkoutBtn.disabled) {
            alert("🛒 Please add something to the cart to checkout.");
          } else {
            checkoutBtn.click();
          }
        } else {
          alert("⚠️ Checkout button not found.");
        }
      } else {
        alert("📦 You are not in the cart. Say 'go to cart' and try again.");
      }
      return;
    }
    // 🧭 Only allow navigation if NOT a product command
    if (navMatch) {
      navigate(navMatch.path);
    } else {
      alert("❓ Command not recognized.");
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <button
        onClick={startRecording}
        style={{
          backgroundColor: isRecording ? "#e53935" : "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          fontSize: 24,
          cursor: "pointer",
          border: "3px solid black",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
        }}
        title="Click and speak command"
      >
        <BsMicFill />
      </button>
    </div>
  );
};

export default FloatingVoiceButton;
