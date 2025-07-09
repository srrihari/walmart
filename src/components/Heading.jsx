// src/components/Heading.js
import React from "react";

export default function Heading({ category }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        color: "grey",
        marginTop: "15px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{ marginLeft: "8px", marginRight: "12px", fontWeight: "bold" }}
      >
        {category}
      </div>
      <div style={{ flex: 1, height: "3px", backgroundColor: "grey" }}></div>
    </div>
  );
}
