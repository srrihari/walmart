import React, { useEffect, useRef } from "react";

function ProductResponse({ history, scrollRef }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <div className="chat-response" ref={scrollRef}>
      {history.map((entry, idx) => (
        <div key={idx} style={{ marginBottom: "1rem" }}>
          {entry.role === "user" ? (
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  background: "#D0F0C0",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  display: "inline-block",
                  maxWidth: "80%",
                }}
              >
                {entry.content}
              </p>
            </div>
          ) : (
            <div>
              <p
                style={{
                  background: "#F4F4F4",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  display: "inline-block",
                  maxWidth: "80%",
                }}
              >
                {entry.content}
              </p>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default ProductResponse;
