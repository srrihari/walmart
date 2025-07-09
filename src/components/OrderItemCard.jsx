export default function OrderItemCard({
  image,
  alt,
  price,
  title,
  rating,
  reviews,
}) {
  return (
    <div className="product-card">
      <img src={image} alt={alt} className="product-image" />

      <div className="price-row">
        <span className="price">Rs.{price.toFixed(2)}</span>
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
    </div>
  );
}
