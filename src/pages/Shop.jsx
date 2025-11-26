// src/pages/Shop.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import API from '../Api/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { CartContext } from '../context/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState('');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    API.get('/products', { params: { category: cat } })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [cat]);

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col md={4}>
          <CategoryFilter categories={categories} value={cat} onChange={e => setCat(e.target.value)} />
        </Col>
      </Row>

      <Row>
        {products.map(p => (
          <Col md={3} sm={6} xs={12} className="mb-4" key={p._id}>
            <ProductCard product={p} onAddToCart={addToCart} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Shop;
