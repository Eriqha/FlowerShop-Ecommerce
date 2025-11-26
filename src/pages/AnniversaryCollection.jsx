import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import API from '../Api/api';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';

const AnniversaryCollection = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get('/products', { params: { categories: 'anniversary' } })
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
          backgroundImage: 'url("/assets/hero1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '140px' 
        }}
      >
        <div style={{ textAlign: 'left', color: '#fff' }}>
          <h1 className="fade-slide-up" style={{ fontSize: '3rem', fontWeight: '700' }}>
            Anniversary Flowers
          </h1>

          <p
            className="fade-slide-up"
            style={{
              maxWidth: '500px',
              marginTop: '10px',
              fontSize: '1.2rem',
            }}
          >
            Celebrate love with our curated selection of fresh and elegant bouquets.
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

export default AnniversaryCollection;
