import React from "react";

export default function ProductCard({
  image,
  alt,
  price,
  originalPrice,
  savings,
  title,
  rating,
  reviews,
  membershipNote,
  availability,
  onAddToCart, // <-- New prop
}) {
  return (
    <div className="product-card">
      <img src={image} alt={alt} className="product-image" />

      <button className="add-button" onClick={onAddToCart}>
        + Add
      </button>

      <div className="price-row">
        <span className="price">{price}</span>
      </div>

      <p className="product-title">{title}</p>

      <div className="rating">
        <span className="stars">
          {rating == null
            ? "No reviews"
            : "★".repeat(Math.round(rating)) +
              "☆".repeat(5 - Math.round(rating))}
        </span>
        <span className="reviews">({reviews})</span>
      </div>

      <p className="membership-note">{membershipNote}</p>

      <ul className="availability">
        {availability.map((line, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ul>
    </div>
  );
}
