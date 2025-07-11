import { useState, useRef } from "react";
import axios from "axios";
import AudioRecord from "../components/AudioRecord";
import SendIcon from "@mui/icons-material/Send";
import ProductResponse from "./ProductResponse";

function ProDoubt() {
  const scrollRef = useRef(null);
  const [text, setText] = useState("");
  const [productId, setProductId] = useState("");
  const [tableName, setTableName] = useState(""); // 🆕 Table selection
  const [chatHistory, setChatHistory] = useState([]);

  const productTables = [
    "Electronics",
    "school_utensils",
    "Groceries",
    "Household",
    "body_care_diet",
    "cloth_accessories",
    "pet",
    "vehicle_care",
  ];

  async function queryProductBot(promptText = text) {
    if (!promptText.trim() || !productId.trim() || !tableName.trim())
      return alert("Please fill in product ID, table, and question.");

    try {
      const res = await axios.post("http://localhost:3001/product-chat", {
        productId,
        tableName, // 🧠 Send table name too
        question: promptText,
      });

      console.log("🧾 Product Chat Response:", res.data);
      setChatHistory(res.data.history);
      setText("");
    } catch (err) {
      console.error("❌ Bot error:", err);
    }
  }

  const handleTranscription = (text) => {
    if (typeof text === "string") {
      setText(text);
    }
  };

  return (
    <div
      className="app-wrapper"
      style={{ padding: "20px", fontFamily: "sans-serif", marginTop: "100px" }}
    >
      <h1
        style={{
          color: "#fff085",
          textShadow: `
            -1px -1px 0 black,
             1px -1px 0 black,
            -1px  1px 0 black,
             1px  1px 0 black
          `,
          fontFamily: '"Space Mono", monospace',
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: "50px",
          textAlign: "center",
          margin: "0",
          color: "#D9A299",
        }}
      >
        ProDoubtAI
      </h1>

      <div
        className="chat-box-container"
        style={{ width: "100%", margin: "0 auto" }}
      >
        {/* 🆕 Product Table Selector */}
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <select
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #aaa",
            }}
          >
            <option value="">Select Product Table</option>
            {productTables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>

          {/* 🔢 Product ID Input */}
          <input
            type="text"
            placeholder="Enter Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #aaa",
              width: "180px",
            }}
          />
        </div>
        <div className="audio-response-container">
          {/* 🎙️ Audio Input */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <AudioRecord onTranscriptionReady={handleTranscription} />
          </div>

          {/* 💬 Chat Display */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              height: "400px",
              overflowY: "auto",
              backgroundColor: "#fff085",
              marginBottom: "20px",
              marginLeft: "20px",
              width: "1150px",
              boxShadow: "5px 10px 8px 5px rgba(0, 0, 0, 0.7)",
              border: "3px solid black",
            }}
            ref={scrollRef}
          >
            <ProductResponse history={chatHistory} scrollRef={scrollRef} />
          </div>
        </div>
        {/* ⌨️ Text Input & Submit */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="input-text"
            type="text"
            placeholder="Ask something about the product..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontSize: "16px",
              border: "1px solid #ccc",
              background: "#fff085",
              border: "3px solid black",
              height: "40px",
            }}
          />
          <SendIcon
            onClick={() => queryProductBot()}
            className="query-submit-button"
            sx={{
              fontSize: 40,
              color: "#D9A299",
              cursor: "pointer",
              textShadow: "2px 2px 5px rgba(0, 0, 0, 0.8)",
              filter: "drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.8))",
            }}
            role="button"
          />
        </div>
      </div>
    </div>
  );
}

export default ProDoubt;
