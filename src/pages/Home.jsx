import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Carousel from '../components/Carousel';
import API from '../Api/api';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const { addToCart } = useContext(CartContext);

  const slides = [
    { image: '/assets/hero4.jpg', title: 'Always Fresh, Always Beautiful', subtitle: 'Express your love with our hand-crafted bouquets' },
    { image: '/assets/hero2.jpg', title: 'Same-Day, Delivery', subtitle: 'Order by 1PM for free same-day delivery in Pampanga' },
    { image: '/assets/hero3.jpg', title: 'Shop Beautiful Flowers, for All Occasions', subtitle: 'Get fresh flowers delivered to your loved ones, anywhere in the Philippines.' },
  ];

  useEffect(() => {
  const fetchFeatured = async () => {
    try {
      const res = await API.get('/products'); // fetch all
      // Only take the first 4 for featured section
      const featuredProducts = res.data.filter(p => p.featured).slice(0, 4); 
      setFeatured(featuredProducts);
    } catch (err) {
      console.error('Error fetching featured products', err);
    }
  };
  fetchFeatured();
}, []);



  return (
    <div>

      {/* HERO CAROUSEL */}
      <Carousel slides={slides} />

      {/* GOT QUESTIONS BAR — TEXT ONLY ANIMATES */}
      <div
        style={{
          background: '#f45c5c',
          color: 'white',
          padding: '60px 0',
          textAlign: 'center',
        }}
      >
        <Container>
          <div className="fade-slide-up" style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>
            GOT QUESTIONS?
          </div>

          <div className="fade-slide-up" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
            REACH US ON <strong>Viber & WhatsApp</strong> AT <strong>+639542511912</strong>
          </div>
        </Container>
      </div>

      {/* FEATURED PRODUCTS */}
      <Container className="py-5">
        <h2 className="text-center mb-4 fade-slide-up">Best Selling Flowers</h2>

        <Row>
          {featured.map(prod => (
            <Col
              md={3}
              sm={6}
              xs={12}
              key={prod._id}
              className="mb-4"
            >
              <div className="fade-slide-up" style={{ animationDelay: `${Math.random() * 0.4}s` }}>
                <ProductCard product={prod} onAddToCart={addToCart} />
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* VALUES SECTION */}
      <div className="py-5 bg-light">
        <Container>
          <Row className="text-center">

            <Col md={4} className="mb-3">
              <div className="fade-slide-up">
                <h5>🌼 Same Day Delivery</h5>
                <p>Order by 1PM and get your bouquet delivered today (Metro Manila).</p>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="fade-slide-up">
                <h5>💐 Fresh Flowers</h5>
                <p>Our florists hand-pick each bloom for quality and freshness.</p>
              </div>
            </Col>

            <Col md={4} className="mb-3">
              <div className="fade-slide-up">
                <h5>💌 Thoughtful Gifts</h5>
                <p>Add message cards, special instructions, and make it personal.</p>
              </div>
            </Col>

          </Row>
        </Container>
      </div>

    </div>
  );
};

export default Home;
