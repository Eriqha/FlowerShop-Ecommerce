// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/FormatPrice';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart }) => {
  const [hovered, setHovered] = useState(false);

  const mainImg =
    product.images?.[0] || "/assets/placeholder.jpg";

  const hoverImg =
    product.images?.[1] || mainImg;

  return (
    <Card
      className="h-100 product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", overflow: "hidden" }}
    >
      <Link to={`/product/${product._id}`}>
        <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
          {/* Main Image */}
          <img
            src={mainImg}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: hovered ? 0 : 1,
              transition: "opacity 0.4s ease"
            }}
          />

          {/* Hover Image */}
          <img
            src={hoverImg}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.4s ease"
            }}
          />
        </div>
      </Link>

      <Card.Body className="d-flex flex-column">
        <Card.Title style={{ fontSize: "1rem" }}>
          {product.name}
        </Card.Title>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          {/* PRICE */}
          <div>
            {product.isOnSale ? (
              <>
                <small className="text-muted text-decoration-line-through me-2">
                  {formatPrice(product.originalPrice)}
                </small>
                <strong className="text-danger">
                  {formatPrice(product.price)}
                </strong>
              </>
            ) : (
              <strong>{formatPrice(product.price)}</strong>
            )}
          </div>

          {/* CART ICON BUTTON */}
          <Button
            size="sm"
            variant="outline-dark"
            onClick={() => onAddToCart(product)}
            style={{
              borderRadius: "50%",
              width: "35px",
              height: "35px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 0
            }}
          >
            <FaShoppingCart size={14} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
