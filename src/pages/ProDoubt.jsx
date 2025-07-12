import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AudioRecord from "../components/AudioRecord";
import SendIcon from "@mui/icons-material/Send";
import ProductResponse from "./ProductResponse";

function ProDoubt() {
  const scrollRef = useRef(null);
  const { category, id } = useParams(); // 🧠 Extract from URL
  const [text, setText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  async function queryProductBot(promptText = text) {
    if (!promptText.trim()) return alert("Please ask a question.");

    try {
      const res = await axios.post("http://localhost:3001/product-chat", {
        productId: id,
        tableName: category,
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
    if (typeof text === "string") setText(text);
  };

  return (
    <div
      className="app-wrapper"
      style={{ padding: "20px", fontFamily: "sans-serif", marginTop: "100px" }}
    >
      <h1
        style={{
          color: "#D9A299",
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
        }}
      >
        ProDoubtAI
      </h1>

      <div
        className="chat-box-container"
        style={{ width: "100%", margin: "0 auto" }}
      >
        <div className="audio-response-container">
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <AudioRecord onTranscriptionReady={handleTranscription} />
          </div>

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
