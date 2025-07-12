import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    name: "TastiAI",
    image: "images/tastiailogo.png",
    link: "/tastiai",
  },
  {
    name: "ImagoMart",
    image: "images/imagomart.png",
    link: "/imagomart",
  },
];

const FeatureBox = () => {
  const headingStyle = {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "600",
    marginTop: "100px",
    color: "#333",
    fontFamily: "Segoe UI, sans-serif",
  };
  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
    padding: "30px",
    backgroundColor: "#f8f8f8",
    borderRadius: "15px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
  };

  const cardStyle = {
    textAlign: "center",
    backgroundColor: "#ffffff",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    padding: "15px",
    textDecoration: "none",
    transition: "transform 0.2s, border-color 0.3s, box-shadow 0.3s",
    color: "inherit",
  };

  const imageStyle = {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    marginBottom: "10px",
    borderRadius: "50px",
  };

  const titleStyle = {
    display: "block",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  };

  return (
    <>
      <h2 style={headingStyle}>AI-powered experiences</h2>
      <div style={containerStyle}>
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            style={cardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "#6a5acd";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img src={feature.image} alt={feature.name} style={imageStyle} />
            <span style={titleStyle}>{feature.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default FeatureBox;
