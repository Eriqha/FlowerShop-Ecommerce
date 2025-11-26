// src/pages/BirthdayCollection.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import API from '../Api/api';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';

const BirthdayCollection = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    // Fetch products from the "birthday" category
    API.get('/products', { params: { categories: 'birthday' } })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      {/* Top Banner with Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '350px',
          backgroundImage: 'url("/assets/hero1.jpg")', // change to birthday image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '140px'
        }}
      >
        <div style={{ textAlign: 'left', color: '#fff' }}>
          <h1 className="fade-slide-up" style={{ fontSize: '3rem', fontWeight: '700' }}>
            Birthday Flowers
          </h1>

          <p
            className="fade-slide-up"
            style={{
              maxWidth: '500px',
              marginTop: '10px',
              fontSize: '1.2rem',
            }}
          >
            Make birthdays unforgettable with our bright and joyful bouquets.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <Container className="py-5">
        <Row>
          {products.map(p => (
            <Col md={3} sm={6} xs={12} className="mb-4 fade-slide-up" key={p._id}>
              <div className="product-hover">
                <ProductCard product={p} onAddToCart={addToCart} />
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Hover Effect */}
      <style>{`
        .product-hover:hover img {
          transform: scale(1.06);
          transition: transform 0.4s ease;
        }

        .fade-slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s ease forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default BirthdayCollection;
